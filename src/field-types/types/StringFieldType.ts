import FieldType from '../FieldType';
import FieldTypeUtils from '../FieldTypeUtils';
import ODM from '../../ODM';
import PrimitiveDataType from '../../core/data-types/PrimitiveDataType';
import Schema from '../../collection/Schema';

export default class StringFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.STRING);
  }

  getName(): string {
    return 'string';
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any
  ): any {
    return value;
  }

  async validateValue(schema: Schema, fieldName: string, record: any) {
    FieldTypeUtils.requiredValidation(schema, fieldName, record);
    await FieldTypeUtils.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      record
    );
  }

  async getDisplayValue(schema: Schema, fieldName: string, record: any) {
    return this.getDataType().toJSON(record[fieldName]);
  }
}
