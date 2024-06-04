import { ColumnDefinitionInternal, NativeDataType } from "../types.ts";
import { JSONValue } from "../../deps.ts";

abstract class DataType {
  readonly #nativeDataType: NativeDataType;
  readonly #name: string;

  protected constructor(name: string, primitiveDataType: NativeDataType) {
    this.#name = name;
    this.#nativeDataType = primitiveDataType;
  }

  getName(): string {
    return this.#name;
  }

  getNativeType(): NativeDataType {
    return this.#nativeDataType;
  }

  /**
   * Validate the column definition
   * @param definition
   * @throws {Error} if the definition is invalid
   */
  abstract validateDefinition(definition: ColumnDefinitionInternal): void;

  abstract toJSONValue(value: unknown): JSONValue;

  abstract setValueIntercept(value: unknown): any;

  abstract validateValue(value: unknown): Promise<void>;
}

export default DataType;
