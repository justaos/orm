import DataType from "../DataType.ts";
import { ColumnDefinition } from "../../types.ts";

export default class TimeDataType extends DataType {
  constructor() {
    super("time", "TIME");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: Temporal.PlainTime | null): string | null {
    if (value instanceof Temporal.PlainTime) {
      return value.toString();
    }
    return value;
  }

  setValueIntercept(
    value: Temporal.PlainTime | null
  ): Temporal.PlainTime | null {
    if (typeof value === "string") {
      return Temporal.PlainTime.from(value);
    }
    if (value instanceof Date) {
      return Temporal.PlainTime.from({
        hour: value.getUTCHours(),
        minute: value.getUTCMinutes(),
        second: value.getUTCSeconds()
      });
    }
    return value;
  }

  async validateValue() {
  }
}
