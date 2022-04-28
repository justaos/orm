import FieldType from '../FieldType';
import * as mongodb from 'mongodb';
import Schema from '../../collection/Schema';
import ODM from '../../ODM';
import FieldTypeUtils from '../FieldTypeUtils';
import PrimitiveDataType from '../../core/data-types/PrimitiveDataType';
import ObjectIdDataType from '../../core/data-types/types/ObjectIdDataType';

export default class ObjectIdFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.OBJECT_ID);
  }

  getName(): string {
    return 'objectId';
  }

  async validateValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any
  ) {
    FieldTypeUtils.requiredValidation(schema, fieldName, record);
    await FieldTypeUtils.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      record
    );
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any
  ): Promise<string | null> {
    const objectIdType = <ObjectIdDataType>this.getDataType();
    return objectIdType.toJSON(record[fieldName]);
  }

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any
  ): mongodb.ObjectId {
    if (typeof value === 'string' && mongodb.ObjectId.isValid(value))
      return new mongodb.ObjectId(value);
    return value;
  }
}
