import { NativeDataType } from "../core/NativeDataType.ts";
import TableSchema from "../table/TableSchema.ts";

export default abstract class DataType {
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
    schema: TableSchema,
    fieldName: string,
    value: any,
    record: any
  ): any;

  abstract validateValue(
    schema: TableSchema,
    fieldName: string,
    record: any,
    context: any
  ): Promise<any>;

  abstract getDisplayValue(
    schema: TableSchema,
    fieldName: string,
    record: any,
    context: any
  ): Promise<any>;
}
