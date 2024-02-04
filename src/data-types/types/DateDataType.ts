import DataType from "../DataType.ts";
import { ColumnDefinition } from "../../types.ts";
import { Temporal } from "../../../deps.ts";

export default class DateDataType extends DataType {
  constructor() {
    super("date", "DATE");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: Temporal.PlainDate | null): string | null {
    if (value instanceof Temporal.PlainDate) {
      return value.toString();
    }
    return value;
  }

  setValueIntercept(
    value: Temporal.PlainDate | null
  ): Temporal.PlainDate | null {
    if (typeof value === "string") {
      return Temporal.PlainDate.from(value);
    }
    if (value instanceof Date) {
      return Temporal.PlainDate.from(value.toISOString().replace("T", " ")
        .replace("Z", ""));
    }
    return value;
  }

  async validateValue() {
  }
}
