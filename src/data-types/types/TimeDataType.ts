import IDataType from "../IDataType.ts";
import type { TColumnDataType, TColumnDefinitionStrict } from "../../types.ts";

export default class TimeDataType extends IDataType {
  constructor() {
    super("time");
  }

  getNativeType(_definition: TColumnDefinitionStrict): TColumnDataType {
    return "VARCHAR";
  }

  validateDefinition(_definition: TColumnDefinitionStrict) {}

  toJSONValue(value: Temporal.PlainTime | null): string | null {
    if (value instanceof Temporal.PlainTime) {
      return value.toString();
    }
    return value;
  }

  setValueIntercept(
    value: Temporal.PlainTime | Date | null,
  ): Temporal.PlainTime | null {
    if (typeof value === "string") {
      return Temporal.PlainTime.from(value);
    }
    if (value instanceof Date) {
      return Temporal.PlainTime.from({
        hour: value.getUTCHours(),
        minute: value.getUTCMinutes(),
        second: value.getUTCSeconds(),
      });
    }
    return value;
  }

  async validateValue() {}
}
