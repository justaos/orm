import { Logger } from "../../deps.ts";
import { JSONObject, RawRecord } from "../types.ts";
import { UUIDUtils } from "../utils.ts";
import Table from "../table/Table.ts";
import ColumnSchema from "../table/ColumnSchema.ts";
import { DatabaseErrorCode, ORMError } from "../errors/ORMError.ts";
import { RecordSaveError } from "../errors/RecordSaveError.ts";
import Query from "../query/Query.ts";
import { FieldValidationError } from "../errors/FieldValidationError.ts";

export default class Record {
  #isNew = false;

  readonly #logger: Logger;

  #record: RawRecord | undefined;

  readonly #queryBuilder: Query;

  readonly #table: Table;

  constructor(
    queryBuilder: Query,
    table: Table,
    logger: Logger,
    record?: RawRecord
  ) {
    this.#queryBuilder = queryBuilder;
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
      .getColumnSchemas()
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
    const record = this.#getRawRecord();
    const schema = this.#table.getTableSchema();
    const field = schema.getColumnSchema(key);
    if (field) {
      record[key] = field.getColumnType().setValueIntercept(value);
    }
  }

  get(key: string): any {
    const record = this.#getRawRecord();
    const schema = this.#table.getTableSchema();
    if (schema.getColumnSchema(key)) return record[key];
    return null;
  }

  getJSONValue(key: string): any {
    const record = this.#getRawRecord();
    const schema = this.#table.getTableSchema();
    const dataType = schema.getColumnSchema(key)?.getColumnType();
    if (dataType && typeof record[key] !== "undefined")
      return dataType.toJSONValue(record[key]);
    return null;
  }

  async insert(): Promise<Record> {
    let [record] = await this.#table.intercept("INSERT", "BEFORE", [this]);

    const recordJson = record.toJSON();
    await this.#validateRecord(recordJson);
    this.#queryBuilder.insert();
    this.#queryBuilder.into(this.#table.getTableNameWithSchema());
    this.#queryBuilder.columns(this.#table.getColumnNames());
    this.#queryBuilder.values([recordJson]);
    this.#queryBuilder.returning("*");

    this.#logger.info(`[Query] ${this.#queryBuilder.getSQLQuery()}`);

    let savedRawRecord: RawRecord;
    try {
      [savedRawRecord] = await this.#queryBuilder.execute();
    } catch (err) {
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getTableSchema().getDefinition(),
        record.getID(),
        [],
        err.message
      );
    }

    [record] = await this.#table.intercept("INSERT", "AFTER", [
      new Record(this.#queryBuilder, this.#table, this.#logger, savedRawRecord)
    ]);
    this.#record = record.toJSON();
    this.#isNew = false;
    return this;
  }

  async update(): Promise<Record> {
    let [record] = await this.#table.intercept("UPDATE", "BEFORE", [this]);

    const recordJson = record.toJSON();
    await this.#validateRecord(recordJson);
    this.#queryBuilder.update();
    this.#queryBuilder.into(this.#table.getTableNameWithSchema());
    this.#queryBuilder.columns(this.#table.getColumnNames().filter((col) => {
      return col !== "id";
    }));
    this.#queryBuilder.where("id", record.getID());
    this.#queryBuilder.value(recordJson);
    this.#queryBuilder.returning("*");

    this.#logger.info(`[Query] ${this.#queryBuilder.getSQLQuery()}`);

    let savedRawRecord: RawRecord;
    try {
      [savedRawRecord] = await this.#queryBuilder.execute();
    } catch (err) {
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getTableSchema().getDefinition(),
        record.getID(),
        [],
        err.message
      );
    }

    [record] = await this.#table.intercept("UPDATE", "AFTER", [
      new Record(this.#queryBuilder, this.#table, this.#logger, savedRawRecord)
    ]);
    this.#record = record.toJSON();
    return this;
  }

  async delete(): Promise<Record> {
    if (this.#isNew) {
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Cannot remove unsaved record"
      );
    }
    const tableSchema = this.#table.getTableSchema();
    const [record] = await this.#table.intercept("DELETE", "BEFORE", [this]);

    this.#queryBuilder.delete();
    this.#queryBuilder.from(this.#table.getTableNameWithSchema());
    this.#queryBuilder.where("id", record.getID());

    this.#logger.info(`[Query] ${this.#queryBuilder.getSQLQuery()}`);

    try {
      await this.#queryBuilder.execute();
    } catch (err) {
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getTableSchema().getDefinition(),
        record.getID(),
        [],
        err.message
      );
    }

    await this.#table.intercept("DELETE", "AFTER", [record]);
    return this;
  }

  toJSON(columns?: string[]): JSONObject {
    const jsonObject: JSONObject = {};
    this.#table
      .getTableSchema()
      .getColumnSchemas()
      .filter((field: ColumnSchema) => {
        return !columns || columns.includes(field.getName());
      })
      .map((columnSchema: ColumnSchema) => {
        jsonObject[columnSchema.getName()] = columnSchema
          .getColumnType()
          .toJSONValue(this.get(columnSchema.getName()));
      });
    return jsonObject;
  }

  #getRawRecord(): RawRecord {
    if (typeof this.#record === "undefined")
      throw new Error("Record not initialized");
    return this.#record;
  }

  async #validateRecord(rawRecord: RawRecord) {
    const tableSchema = this.#table.getTableSchema();
    const context = this.#table.getContext();
    const fieldErrors: any[] = [];
    for (const columnSchema of tableSchema.getColumnSchemas()) {
      const value = rawRecord[columnSchema.getName()];
      try {
        await columnSchema.getColumnType().validateValue(value);
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
}
