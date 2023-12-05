import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import { DateUtils, Temporal } from "../../../deps.ts";
import { RawRecord } from "../../record/RawRecord.ts";
import { NATIVE_DATA_TYPES } from "../../core/NativeDataType.ts";

export default class DateTimeFieldType extends DataType {
  constructor() {
    super(NATIVE_DATA_TYPES.DATE);
  }

  getName(): string {
    return "datetime";
  }

  async validateValue(
    _schema: TableSchema,
    _fieldName: string,
    _record: RawRecord
  ) {}

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  setValueIntercept(
    _schema: TableSchema,
    _fieldName: string,
    value: any,
    _record: any
  ): any {
    if (typeof value === "string" && DateUtils.isIsoDate(value)) {
      return new Date(value);
    }
    return value;
  }

  getNativeValue(value: any): any {
    if (value instanceof Temporal.PlainDate) {
      return value.toString();
    }
    return value;
  }

  async getDisplayValue(
    _schema: TableSchema,
    fieldName: string,
    record: RawRecord
  ) {
    return record[fieldName];
  }
}
