import DataType from "../DataType.ts";
import { Temporal } from "../../../deps.ts";
import { ColumnDefinition } from "../../types.ts";

export default class DateTimeDataType extends DataType {
  constructor() {
    super("datetime", "TIMESTAMP");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: Temporal.PlainDateTime | null): string | null {
    if (value instanceof Temporal.PlainDateTime) {
      return value.toString();
    }
    return value;
  }

  setValueIntercept(
    value: Temporal.PlainDateTime | string | null
  ): Temporal.PlainDateTime | null {
    if (typeof value === "string") {
      return Temporal.PlainDateTime.from(value);
    }
    if (value instanceof Date) {
      return Temporal.PlainDateTime.from({
        year: value.getUTCFullYear(),
        month: value.getUTCMonth(),
        day: value.getUTCDate(),
        hour: value.getUTCHours(),
        minute: value.getUTCMinutes(),
        second: value.getUTCSeconds()
      });
    }
    return value;
  }

  async validateValue() {}
}
