import DataType from "../DataType.ts";
import { ColumnDefinition } from "../../types.ts";
import { JSONValue } from "../../../deps.ts";

export default class JSONDataType extends DataType {
  constructor() {
    super("json", "JSON");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: JSONValue | null): JSONValue | null {
    return value;
  }

  setValueIntercept(value: JSONValue | null): JSONValue | null {
    return value;
  }

  async validateValue(value: any) {
    if (value === null || typeof value === "object") return;
    throw new Error(`Invalid JSON value: ${value}`);
  }
}
