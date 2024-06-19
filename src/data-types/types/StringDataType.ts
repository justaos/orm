import IDataType from "../IDataType.ts";
import type { TColumnDataType, TColumnDefinitionStrict } from "../../types.ts";

export default class StringDataType extends IDataType {
  constructor() {
    super("string");
  }

  getNativeType(_definition: TColumnDefinitionStrict): TColumnDataType {
    return "VARCHAR";
  }

  toJSONValue(value: string | null): string | null {
    return value;
  }

  validateDefinition(_definition: TColumnDefinitionStrict) {}

  setValueIntercept(value: string | number | null): string | null {
    if (value === null) return null;
    return String(value);
  }

  async validateValue() {}
}
