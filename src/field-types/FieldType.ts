import NativeDataType from "../core/NativeDataType.ts";
import Schema from "../collection/Schema.ts";

export default abstract class FieldType {
  category: string[] = [];
  readonly #primitiveDataType: NativeDataType;

  protected constructor(primitiveDataType: NativeDataType) {
    this.#primitiveDataType = primitiveDataType;
  }
  getNativeType(): NativeDataType {
    return this.#primitiveDataType;
  }

  is(category: string): boolean {
    return this.category.includes(category);
  }

  abstract getName(): string;

  abstract validateDefinition(fieldDefinition: any): boolean;

  abstract setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any
  ): any;

  abstract validateValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any
  ): Promise<any>;

  abstract getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any
  ): Promise<any>;
}
