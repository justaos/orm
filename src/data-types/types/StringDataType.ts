import DataType from "../DataType.ts";
import type { ColumnDefinitionInternal } from "../../types.ts";

export default class StringDataType extends DataType {
  constructor() {
    super("string", "VARCHAR");
  }

  toJSONValue(value: string | null): string | null {
    return value;
  }

  validateDefinition(_definition: ColumnDefinitionInternal) {}

  setValueIntercept(value: string | number | null): string | null {
    if (value === null || typeof value === "undefined") return null;
    return String(value);
  }

  async validateValue() {}
}
