import DataType from "../DataType.ts";
import { ColumnDefinition } from "../../types.ts";
import { CommonUtils, UUID } from "../../../deps.ts";

export default class UUIDDataType extends DataType {
  constructor() {
    super("uuid", "UUID");
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  toJSONValue(value: UUID | null): string | null {
    return value;
  }

  setValueIntercept(value: string | UUID | null): UUID | null {
    return value;
  }

  async validateValue(value: string | null) {
    if (typeof value === "string" && !CommonUtils.validateUUID(value))
      throw new Error(`Invalid UUID value: ${value}`);
  }
}
