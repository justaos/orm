import { NativeDataType } from "../core/NativeDataType.ts";
import TableSchema from "../table/TableSchema.ts";
import { RawRecord } from "../record/RawRecord.ts";
import { ColumnDefinition } from "../table/definitions/ColumnDefinition.ts";
import { DatabaseOperationContext } from "../operation-interceptor/DatabaseOperationContext.ts";

export default abstract class DataType {
  readonly #nativeDataType: NativeDataType;

  protected constructor(primitiveDataType: NativeDataType) {
    this.#nativeDataType = primitiveDataType;
  }

  getNativeType(): NativeDataType {
    return this.#nativeDataType;
  }

  abstract getName(): string;
  
  getNativeValue(value: any): any {
    return value;
  }

  validateDefinition(definition: ColumnDefinition): boolean {
    throw new Error("Method not implemented.");
  }

  abstract setValueIntercept(
    schema: TableSchema,
    fieldName: string,
    value: any,
    record: RawRecord
  ): any;

  abstract validateValue(
    schema: TableSchema,
    fieldName: string,
    record: RawRecord | undefined,
    context?: DatabaseOperationContext
  ): Promise<void>;
}
