import DataType from '../core/data-types/DataType.ts';
import ODM from '../ODM.ts';
import DataTypeFactory from '../core/data-types/DataTypeFactory.ts';
import PrimitiveDataType from '../core/data-types/PrimitiveDataType.ts';
import Schema from '../collection/Schema.ts';

export default abstract class FieldType {
  category: string[] = [];
  readonly #odm: ODM;
  readonly #dataType: DataType;

  constructor(odm: ODM, primitiveDataType: PrimitiveDataType) {
    this.#odm = odm;
    this.#dataType = DataTypeFactory.getDataType(primitiveDataType);
  }

  getODM(): ODM {
    return this.#odm;
  }

  getDataType(): DataType {
    return this.#dataType;
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
