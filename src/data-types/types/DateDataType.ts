import IDataType from "../IDataType.ts";
import type { TColumnDataType, TColumnDefinitionStrict } from "../../types.ts";

export default class DateDataType extends IDataType {
  constructor() {
    super("date");
  }

  getNativeType(_definition: TColumnDefinitionStrict): TColumnDataType {
    return "DATE";
  }

  validateDefinition(_definition: TColumnDefinitionStrict) {}

  toJSONValue(value: Temporal.PlainDate | null): string | null {
    if (value instanceof Temporal.PlainDate) {
      return value.toString();
    }
    return value;
  }

  setValueIntercept(
    value: Temporal.PlainDate | null,
  ): Temporal.PlainDate | null {
    if (typeof value === "string") {
      return Temporal.PlainDate.from(value);
    }
    if (value instanceof Date) {
      return Temporal.PlainDate.from(
        value.toISOString().replace("T", " ").replace("Z", ""),
      );
    }
    return value;
  }

  async validateValue() {}
}
