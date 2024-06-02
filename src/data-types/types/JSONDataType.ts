import DataType from "../DataType.ts";
import { ColumnDefinitionInternal } from "../../types.ts";
import { JSONValue } from "../../../deps.ts";

export default class JSONDataType extends DataType {
  constructor() {
    super("json", "JSON");
  }

  validateDefinition(_definition: ColumnDefinitionInternal): boolean {
    return true;
  }

  toJSONValue(value: JSONValue): JSONValue {
    return value;
  }

  setValueIntercept(value: JSONValue): JSONValue {
    return value;
  }

  async validateValue(value: any) {
    if (value === null || typeof value === "object") return;
    throw new Error(`Invalid JSON value: ${value}`);
  }
}
