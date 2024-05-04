import DataType from "../DataType.ts";
import { ColumnDefinition } from "../../types.ts";

export default class BooleanDataType extends DataType {
  constructor() {
    super("boolean", "BOOLEAN");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: boolean | null): boolean | null {
    return value;
  }

  setValueIntercept(
    value: boolean | number | string | null,
  ): boolean | string | number | null {
    if (typeof value === "string") {
      if (value === "true") return true;
      if (value === "false") return false;
    }
    if (typeof value === "number") {
      if (value === 0) return false;
      if (value === 1) return true;
    }
    return value;
  }

  async validateValue() {}
}
