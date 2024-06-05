import { CommonUtils, type JSONValue, type Logger } from "../../deps.ts";
import type { RawRecord } from "../types.ts";
import type Table from "../table/Table.ts";
import type ColumnDefinitionHandler from "../table/ColumnDefinitionHandler.ts";
import { RecordSaveError } from "../errors/RecordSaveError.ts";
import type Query from "../query/Query.ts";
import { FieldValidationError } from "../errors/FieldValidationError.ts";
import { logSQLQuery } from "../utils.ts";
import { ORMGeneralError } from "../errors/ORMGeneralError.ts";

export default class Record {
  #isNew = false;

  readonly #logger: Logger;

  #record?: RawRecord;

  readonly #queryBuilder: Query;

  readonly #table: Table;

  #columnsModified: { [key: string]: boolean } = {};

  constructor(
    queryBuilder: Query,
    table: Table,
    logger: Logger,
    record?: RawRecord,
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
    this.#columnsModified = {};
    this.#table.getColumns().map((field: ColumnDefinitionHandler) => {
      if (typeof field.getDefaultValue() === "undefined") {
        this.set(field.getName(), null);
      } else this.set(field.getName(), field.getDefaultValue());
    });
    this.#record["id"] = CommonUtils.generateUUID();
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
    const field = this.#table.getColumnSchema(key);
    if (field) {
      record[key] = field.getColumnType().setValueIntercept(value);
      this.#columnsModified[key] = true;
    }
  }

  get(key: string): any {
    const record = this.#getRawRecord();
    if (this.#table.getColumnSchema(key)) return record[key];
    return null;
  }

  getJSONValue(key: string): JSONValue {
    const record = this.#getRawRecord();
    const dataType = this.#table.getColumnSchema(key)?.getColumnType();
    if (dataType && typeof record[key] !== "undefined") {
      const jsonValue = <JSONValue> dataType.toJSONValue(record[key]);
      if (typeof jsonValue === "undefined") return null;
      return jsonValue;
    }
    return null;
  }

  async insert(): Promise<Record> {
    let [record] = await this.#table.intercept("INSERT", "BEFORE", [this]);

    const recordJson = record.toJSON();
    await this.#validateRecord(recordJson);
    this.#queryBuilder.insert();
    this.#queryBuilder.into(this.#table.getName());
    this.#queryBuilder.columns(this.#table.getColumnNames());
    this.#queryBuilder.values([recordJson]);
    this.#queryBuilder.returning("*");

    logSQLQuery(this.#logger, this.#queryBuilder.getSQLQuery());

    let savedRawRecord: RawRecord;
    try {
      [savedRawRecord] = await this.#queryBuilder.execute();
    } catch (err) {
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getDefinitionClone(),
        record.getID(),
        [],
        err.message,
      );
    }

    [record] = await this.#table.intercept("INSERT", "AFTER", [
      new Record(this.#queryBuilder, this.#table, this.#logger, savedRawRecord),
    ]);
    this.#record = record.toJSON();
    this.#isNew = false;
    this.#columnsModified = {};
    return this;
  }

  async update(): Promise<Record> {
    let [record] = await this.#table.intercept("UPDATE", "BEFORE", [this]);

    const recordJson = record.toJSON();
    await this.#validateRecord(recordJson);
    this.#queryBuilder.update();
    this.#queryBuilder.into(this.#table.getName());
    this.#queryBuilder.columns(
      Object.keys(this.#columnsModified).filter((col) => {
        return col !== "id";
      }),
    );
    this.#queryBuilder.where("id", record.getID());
    this.#queryBuilder.value(recordJson);
    this.#queryBuilder.returning("*");

    logSQLQuery(this.#logger, this.#queryBuilder.getSQLQuery());

    let savedRawRecord: RawRecord;
    try {
      [savedRawRecord] = await this.#queryBuilder.execute();
    } catch (err) {
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getDefinitionClone(),
        record.getID(),
        [],
        err.message,
      );
    }

    [record] = await this.#table.intercept("UPDATE", "AFTER", [
      new Record(this.#queryBuilder, this.#table, this.#logger, savedRawRecord),
    ]);
    this.#record = record.toJSON();
    this.#columnsModified = {};
    return this;
  }

  async delete(): Promise<Record> {
    if (this.#isNew) {
      throw new ORMGeneralError("Cannot remove unsaved record");
    }
    const [record] = await this.#table.intercept("DELETE", "BEFORE", [this]);

    this.#queryBuilder.delete();
    this.#queryBuilder.from(this.#table.getName());
    this.#queryBuilder.where("id", record.getID());

    logSQLQuery(this.#logger, this.#queryBuilder.getSQLQuery());

    try {
      await this.#queryBuilder.execute();
    } catch (err) {
      this.#logger.error(err);
      throw new RecordSaveError(
        this.#table.getDefinitionClone(),
        record.getID(),
        [],
        err.message,
      );
    }

    await this.#table.intercept("DELETE", "AFTER", [record]);
    return this;
  }

  toJSON(columns?: string[]): RawRecord {
    const rawRecord: RawRecord = {};
    this.#table
      .getColumns()
      .filter((field: ColumnDefinitionHandler) => {
        return !columns || columns.includes(field.getName());
      })
      .map((columnSchema: ColumnDefinitionHandler) => {
        rawRecord[columnSchema.getName()] = columnSchema
          .getColumnType()
          .toJSONValue(this.get(columnSchema.getName()));
      });
    return rawRecord;
  }

  #getRawRecord(): RawRecord {
    if (typeof this.#record === "undefined") {
      throw new ORMGeneralError("Record not initialized");
    }
    return this.#record;
  }

  async #validateRecord(rawRecord: RawRecord) {
    const fieldErrors: FieldValidationError[] = [];
    for (const columnSchema of this.#table.getColumns()) {
      const value = rawRecord[columnSchema.getName()];
      try {
        await columnSchema.getColumnType().validateValue(value);
      } catch (err) {
        fieldErrors.push(
          new FieldValidationError(
            columnSchema.getDefinitionClone(),
            value,
            err.message,
          ),
        );
      }
    }
    if (fieldErrors.length) {
      throw new RecordSaveError(
        this.#table.getDefinitionClone(),
        rawRecord.id,
        fieldErrors,
      );
    }
  }
}
