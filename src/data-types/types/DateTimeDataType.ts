import IDataType from "../IDataType.ts";
import type { TColumnDataType, TColumnDefinitionStrict } from "../../types.ts";

export default class DateTimeDataType extends IDataType {
  constructor() {
    super("datetime");
  }

  getNativeType(_definition: TColumnDefinitionStrict): TColumnDataType {
    return "TIMESTAMP";
  }

  validateDefinition(_definition: TColumnDefinitionStrict) {}

  toJSONValue(value: Temporal.PlainDateTime | null): string | null {
    if (value instanceof Temporal.PlainDateTime) {
      return value.toString();
    }
    return value;
  }

  setValueIntercept(
    value: Temporal.PlainDateTime | string | null,
  ): Temporal.PlainDateTime | null {
    if (typeof value === "string") {
      return Temporal.PlainDateTime.from(value);
    }
    if (value instanceof Date) {
      return Temporal.PlainDateTime.from(
        value.toISOString().replace("T", " ").replace("Z", ""),
      );
    }
    return value;
  }

  async validateValue() {}
}
