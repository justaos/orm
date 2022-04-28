import FieldType from '../FieldType';
import Schema from '../../collection/Schema';
import ODM from '../../ODM';
import FieldTypeUtils from '../FieldTypeUtils';
import PrimitiveDataType from '../../core/data-types/PrimitiveDataType';

export default class IntegerFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.INTEGER);
  }

  getName(): string {
    return 'integer';
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
    const fieldDefinition = schema.getField(fieldName)?.getDefinition();
    const value = record[fieldName];
    if (
      Number.isInteger(fieldDefinition.maximum) &&
      fieldDefinition.maximum < value
    )
      throw new Error(`should be less than ${fieldDefinition.maximum}`);
    if (
      Number.isInteger(fieldDefinition.minimum) &&
      fieldDefinition.minimum > value
    )
      throw new Error(`should be more than ${fieldDefinition.minimum}`);
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any
  ) {
    return this.getDataType().toJSON(record[fieldName]);
  }

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any
  ): any {
    return value;
  }
}
