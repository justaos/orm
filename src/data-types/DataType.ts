import { NativeDataType } from "../core/NativeDataType.ts";
import TableSchema from "../table/TableSchema.ts";
import { RawRecord } from "../record/RawRecord.ts";
import { ColumnDefinition } from "../table/definitions/ColumnDefinition.ts";

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

  getRegistryKey(): string {
    return this.getName();
  }

  getNativeValue(value: any): any {
    return value;
  }

  abstract validateDefinition(definition: ColumnDefinition): boolean;

  abstract setValueIntercept(
    schema: TableSchema,
    fieldName: string,
    value: any,
    record: RawRecord | undefined
  ): any;

  abstract validateValue(
    schema: TableSchema,
    fieldName: string,
    record: RawRecord | undefined,
    context: any
  ): Promise<void>;

  abstract getDisplayValue(
    schema: TableSchema,
    fieldName: string,
    record: RawRecord,
    context: any
  ): Promise<any>;
}
