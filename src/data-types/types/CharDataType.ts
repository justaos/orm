import DataType from "../DataType.ts";
import { ColumnDefinition } from "../../types.ts";

export default class CharDataType extends DataType {
  constructor() {
    super("string", "CHAR");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: string | null): string | null {
    return value;
  }

  setValueIntercept(value: string | number | null): string | null {
    if (value === null) return null;
    return String(value);
  }

  async validateValue() {}
}
