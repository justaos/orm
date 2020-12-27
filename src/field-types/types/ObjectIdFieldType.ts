import DataType from '../../core/data-types/dataType.interface';
import FieldType from '../FieldType.interface';
import ObjectIdDataType from '../../core/data-types/types/objectIdDataType';
import { ObjectId } from 'mongodb';
import Schema from '../../collection/Schema';
import ODM from '../../ODM';
import FieldTypeUtils from '../FieldTypeUtils';
import Field from '../../collection/Field';

export default class ObjectIdFieldType extends FieldType {
  #dataType: DataType = new ObjectIdDataType();

  #odm?: ODM;

  setODM(odm: ODM) {
    this.#odm = odm;
  }

  getDataType(): DataType {
    return this.#dataType;
  }

  getType(): string {
    return 'objectId';
  }

  async validateValue(schema: Schema, field: Field, record: any, context: any) {
    FieldTypeUtils.requiredValidation(schema, field, record);
    await FieldTypeUtils.uniqueValidation(this.#odm, schema, field, record);
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(schema: any, field: Field, record: any, context: any) {
    return this.#dataType.toJSON(record[field.getName()]);
  }

  getValueIntercept(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ): any {
    return record[field.getName()];
  }

  setValueIntercept(
    schema: Schema,
    field: Field,
    newValue: any,
    record: any,
    context: any
  ): any {
    if (typeof newValue === 'string' && ObjectId.isValid(newValue))
      return new ObjectId(newValue);
    return newValue;
  }
}
