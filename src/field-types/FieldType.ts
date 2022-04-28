import DataType from '../core/data-types/DataType';
import ODM from '../ODM';
import DataTypeFactory from '../core/data-types/DataTypeFactory';
import PrimitiveDataType from '../core/data-types/PrimitiveDataType';
import Schema from '../collection/Schema';

export default abstract class FieldType {
  category: string[] = [];
  readonly #odm: ODM;
  readonly #dataType: DataType;

  constructor(odm: ODM, primitiveDataType: PrimitiveDataType) {
    this.#odm = odm;
    this.#dataType = DataTypeFactory.getDataType(primitiveDataType);
  }

  getODM() {
    return this.#odm;
  }

  getDataType() {
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
