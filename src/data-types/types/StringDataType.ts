import DataType from "../DataType.ts";
import { ColumnDefinitionInternal } from "../../types.ts";

export default class StringDataType extends DataType {
  constructor() {
    super("string", "VARCHAR");
  }

  toJSONValue(value: string | null): string | null {
    return value;
  }

  validateDefinition(_definition: ColumnDefinitionInternal): boolean {
    return true;
  }

  setValueIntercept(value: string | number | null): string | null {
    if (value === null) return null;
    return String(value);
  }

  async validateValue() {}
}
