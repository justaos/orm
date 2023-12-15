import { ColumnDefinition, JSONValue, NativeDataType } from "../types.ts";

export default abstract class DataType {
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

  abstract validateDefinition(definition: ColumnDefinition): boolean;

  abstract toJSONValue(value: unknown): JSONValue;

  abstract setValueIntercept(value: unknown): unknown;

  abstract validateValue(value: unknown): Promise<void>;
}
