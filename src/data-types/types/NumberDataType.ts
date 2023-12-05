import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import { ColumnDefinition } from "../../table/definitions/ColumnDefinition.ts";
import { RawRecord } from "../../record/RawRecord.ts";

export default class NumberDataType extends DataType {
  constructor() {
    super("decimal");
  }

  getName(): string {
    return "number";
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  setValueIntercept(
    _schema: TableSchema,
    _fieldName: string,
    value: any,
    _record: RawRecord
  ): any {
    if (typeof value === "string") {
      // @ts-ignore
      return value * 1;
    }
    return value;
  }

  async validateValue(
    _schema: TableSchema,
    _fieldName: string,
    _record: RawRecord
  ) {}

  // deno-lint-ignore require-await
  async getDisplayValue(
    _schema: TableSchema,
    fieldName: string,
    record: RawRecord
  ) {
    return record[fieldName];
  }
}
