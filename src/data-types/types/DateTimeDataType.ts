import DataType from "../DataType.ts";
import { ColumnDefinitionInternal } from "../../types.ts";

export default class DateTimeDataType extends DataType {
  constructor() {
    super("datetime", "TIMESTAMP");
  }

  validateDefinition(_definition: ColumnDefinitionInternal) {}

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
