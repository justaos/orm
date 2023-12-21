import DataType from "../DataType.ts";
import { ColumnDefinition, UUID } from "../../types.ts";
import { UUIDUtils } from "../../utils.ts";

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
    if (typeof value === 'string' && !UUIDUtils.isValidId(value))
      throw new Error(`Invalid UUID value: ${value}`);
  }
}
