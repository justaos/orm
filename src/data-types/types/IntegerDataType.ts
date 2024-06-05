import DataType from "../DataType.ts";
import type { ColumnDefinitionInternal } from "../../types.ts";

export default class IntegerDataType extends DataType {
  constructor() {
    super("integer", "INTEGER");
  }

  toJSONValue(value: number | null): number | null {
    return value;
  }

  validateDefinition(_definition: ColumnDefinitionInternal) {}

  setValueIntercept(value: number | string | null): number | null {
    if (value === null) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseInt(value, 10);
    return value;
  }

  async validateValue(value: any) {
    if (value !== null && typeof value !== "number") {
      throw new Error(`Invalid integer value: ${value}`);
    }
  }
}
