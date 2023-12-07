import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import { NATIVE_DATA_TYPES } from "../../core/NativeDataType.ts";
import { ColumnDefinition } from "../../table/definitions/ColumnDefinition.ts";
import { RawRecord } from "../../record/RawRecord.ts";
import { Temporal } from "../../../deps.ts";

export default class DateDataType extends DataType {
  constructor() {
    super(NATIVE_DATA_TYPES.DATE);
  }

  getName(): string {
    return "date";
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
  ): Temporal.PlainDate {
    if (typeof value === "string") {
      return Temporal.PlainDate.from(value);
    }
    return value;
  }

  getNativeValue(value: any): any {
    if (value instanceof Temporal.PlainDate) {
      return value.toString();
    }
    return value;
  }
}
