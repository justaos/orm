import Table from "../table/Table.ts";
import ColumnSchema from "../table/ColumnSchema.ts";
import { RawRecord } from "./RawRecord.ts";
import { UUIDUtils } from "../core/UUID.ts";

export default class Record {
  #isNew = false;

  #record: RawRecord | undefined;

  readonly #table: Table;

  constructor(record: any, table: Table) {
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

  getCollection(): Table {
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
    const [record] = await this.#table.insertRecords([this]);
    this.#record = record.toJSON();
    this.#isNew = false;
    return this;
  }

  async update(): Promise<Record> {
    const record = await this.#table.updateRecord(this);
    this.#record = record.toJSON();
    this.#isNew = false;
    return this;
  }

  /* async delete(): Promise<Record> {
    if (this.#isNew) {
      throw Error("[Record::remove] Cannot remove unsaved record");
    }
    await this.#table.deleteOne(this);
    return this;
  }
*/
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
