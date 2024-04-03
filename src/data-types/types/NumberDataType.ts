import DataType from "../DataType.ts";
import { ColumnDefinition } from "../../types.ts";

export default class NumberDataType extends DataType {
  constructor() {
    super("number", "DECIMAL");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: number | null): number | null {
    return value;
  }

  setValueIntercept(value: number | string | null): number | null {
    //@ts-ignore
    if (typeof value === "string") return value * 1;
    return value;
  }

  async validateValue(value: any) {
    if (value !== null && typeof value !== "number") {
      throw new Error(`Invalid integer value: ${value}`);
    }
  }
}
