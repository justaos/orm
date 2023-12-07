import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import { Temporal } from "../../../deps.ts";
import { RawRecord } from "../../record/RawRecord.ts";
import { NATIVE_DATA_TYPES } from "../../core/NativeDataType.ts";
import { ColumnDefinition } from "../../table/definitions/ColumnDefinition.ts";

export default class DateTimeDataType extends DataType {
  constructor() {
    super(NATIVE_DATA_TYPES.TIMESTAMP);
  }

  getName(): string {
    return "datetime";
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  async validateValue(
    _schema: TableSchema,
    _fieldName: string,
    _record: RawRecord
  ) {}

  setValueIntercept(
    _schema: TableSchema,
    _fieldName: string,
    value: any,
    _record: RawRecord
  ): Temporal.PlainDateTime {
    if (typeof value === "string") {
      return Temporal.PlainDateTime.from(value);
    }
    return value;
  }

  getNativeValue(value: any): any {
    if (value instanceof Temporal.PlainDateTime) {
      return value.toString();
    }
    return value;
  }
}
