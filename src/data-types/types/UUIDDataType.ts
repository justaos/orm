import DataType from "../DataType.ts";
import { ColumnDefinitionInternal } from "../../types.ts";
import { CommonUtils, UUID4 } from "../../../deps.ts";

export default class UUIDDataType extends DataType {
  constructor() {
    super("uuid", "UUID");
  }

  validateDefinition(_definition: ColumnDefinitionInternal): boolean {
    return true;
  }

  toJSONValue(value: UUID4 | null): string | null {
    return value;
  }

  setValueIntercept(value: UUID4 | null): UUID4 | null {
    return value;
  }

  async validateValue(value: string | null) {
    if (typeof value === "string" && !CommonUtils.validateUUID(value)) {
      throw new Error(`Invalid UUID value: ${value}`);
    }
  }
}
