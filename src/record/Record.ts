import Table from "../table/Table.ts";
import ColumnSchema from "../table/ColumnSchema.ts";
import { RawRecord } from "./RawRecord.ts";
import { UUIDUtils } from "../core/UUID.ts";
import { DatabaseErrorCode, ODMError } from "../errors/ODMError.ts";
import { OPERATION_TYPES, OPERATION_WHENS } from "../constants.ts";
import { RecordSaveError } from "../errors/RecordSaveError.ts";
import { FieldValidationError } from "../errors/FieldValidationError.ts";
import { Logger } from "../../deps.ts";

export default class Record {
  #isNew = false;

  readonly #sql: any;

  #logger: Logger;

  #record: RawRecord | undefined;

  readonly #table: Table;

  constructor(sql: any, table: Table, logger: Logger, record?: RawRecord) {
    this.#sql = sql;
    this.#logger = logger;
    this.#table = table;
    if (typeof record !== "undefined") {
      this.#record = {};
      for (const key of Object.keys(record)) this.set(key, record[key]);
    }
  }

  initialize(): Record {
    this.#record = {};
    this.#table
      .getTableSchema()
      .getAllColumnSchemas()
      .map((field: ColumnSchema) => {
        this.set(field.getName(), field.getDefaultValue() || null);
      });
    this.#record["id"] = UUIDUtils.generateId();
    this.#record["_table"] = this.#table.getName();
    this.#isNew = true;
    return this;
  }

  isNew(): boolean {
    return this.#isNew;
  }

  getTable(): Table {
    return this.#table;
  }

  getID(): string {
    return this.get("id");
  }

  set(key: string, value: any): void {
    if (typeof this.#record === "undefined")
      throw new Error("Record not initialized");

    const schema = this.#table.getTableSchema();
    const field = schema.getColumnSchema(key);
    if (field && this.#record) {
      this.#record[key] = field
        .getColumnType()
        .setValueIntercept(
          this.#table.getTableSchema(),
          key,
          value,
          this.#record
        );
    }
  }

  get(key: string): any {
    if (typeof this.#record === "undefined")
      throw new Error("Record not initialized");
    const schema = this.#table.getTableSchema();
    if (schema.getColumnSchema(key) && typeof this.#record[key] !== "undefined")
      return this.#record[key];
    return null;
  }

  getNativeValue(key: string): any {
    if (typeof this.#record === "undefined")
      throw new Error("Record not initialized");
    const schema = this.#table.getTableSchema();
    const dataType = schema.getColumnSchema(key)?.getColumnType();
    if (dataType && typeof this.#record[key] !== "undefined")
      return dataType.getNativeValue(this.#record[key]);
    return null;
  }

  async insert(): Promise<Record> {
    let [record] = await this.#table.intercept(
      OPERATION_TYPES.CREATE,
      OPERATION_WHENS.BEFORE,
      [this]
    );

    await this.#validateRecord(record.toJSON());

    let savedRawRecord: RawRecord;
    const reserve = await this.#sql.reserve();
    try {
      const command = reserve`INSERT INTO ${reserve(
        this.#table.getTableSchema().getFullName()
      )} ${reserve(record.toJSON())} RETURNING *`;
      [savedRawRecord] = await command.execute();
    } catch (err) {
      reserve.release();
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getTableSchema().getDefinition(),
        record.getID(),
        [],
        err.message
      );
    } finally {
      reserve.release();
    }

    [record] = await this.#table.intercept(
      OPERATION_TYPES.CREATE,
      OPERATION_WHENS.AFTER,
      [new Record(this.#sql, this.#table, this.#logger, savedRawRecord)]
    );
    this.#record = record.toJSON();
    this.#isNew = false;
    return this;
  }

  async update(): Promise<Record> {
    let [record] = await this.#table.intercept(
      OPERATION_TYPES.UPDATE,
      OPERATION_WHENS.BEFORE,
      [this]
    );

    await this.#validateRecord(record.toJSON());

    let savedRawRecord: RawRecord;
    const reserve = await this.#sql.reserve();
    try {
      const command = reserve`UPDATE ${reserve(
        this.#table.getTableSchema().getFullName()
      )} set ${reserve(
        record.toJSON()
      )}   where id = ${record.getID()} RETURNING *`;
      [savedRawRecord] = await command.execute();
    } catch (err) {
      reserve.release();
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getTableSchema().getDefinition(),
        record.getID(),
        [],
        err.message
      );
    } finally {
      reserve.release();
    }

    [record] = await this.#table.intercept(
      OPERATION_TYPES.UPDATE,
      OPERATION_WHENS.AFTER,
      [new Record(this.#sql, this.#table, this.#logger, savedRawRecord)]
    );
    this.#record = record.toJSON();
    return this;
  }

  async delete(): Promise<Record> {
    if (this.#isNew) {
      throw new ODMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Cannot remove unsaved record"
      );
    }
    const [record] = await this.#table.intercept(
      OPERATION_TYPES.DELETE,
      OPERATION_WHENS.BEFORE,
      [this]
    );

    const reserve = await this.#sql.reserve();
    try {
      const command = reserve`DELETE FROM ${reserve(
        this.#table.getTableSchema().getFullName()
      )} where id = ${this.getID()}`;
      await command.execute();
    } catch (err) {
      reserve.release();
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getTableSchema().getDefinition(),
        this.getID(),
        [],
        err.message
      );
    } finally {
      reserve.release();
    }

    await this.#table.intercept(OPERATION_TYPES.DELETE, OPERATION_WHENS.AFTER, [
      record
    ]);
    return this;
  }

  async #validateRecord(rawRecord: RawRecord) {
    const tableSchema = this.#table.getTableSchema();
    const context = this.#table.getContext();
    const fieldErrors: any[] = [];
    for (const columnSchema of tableSchema.getAllColumnSchemas()) {
      const value = rawRecord[columnSchema.getName()];
      try {
        await columnSchema
          .getColumnType()
          .validateValue(
            tableSchema,
            columnSchema.getName(),
            rawRecord,
            context
          );
      } catch (err) {
        fieldErrors.push(
          new FieldValidationError(
            columnSchema.getDefinition(),
            value,
            err.message
          )
        );
      }
    }
    if (fieldErrors.length) {
      throw new RecordSaveError(
        tableSchema.getDefinition(),
        rawRecord.id,
        fieldErrors
      );
    }
  }

  toJSON(columns?: string[]): any {
    const jsonObject: any = {};
    this.#table
      .getTableSchema()
      .getAllColumnSchemas()
      .filter((field: ColumnSchema) => {
        if (columns) {
          return columns.includes(field.getName());
        }
        return true;
      })
      .map((field: ColumnSchema) => {
        jsonObject[field.getName()] = this.getNativeValue(field.getName());
      });
    return jsonObject;
  }
}
