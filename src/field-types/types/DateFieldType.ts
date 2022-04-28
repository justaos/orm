import FieldType from '../FieldType';
import Schema from '../../collection/Schema';
import ODM from '../../ODM';
import FieldTypeUtils from '../FieldTypeUtils';
import { DateUtils } from '@justaos/utils';
import PrimitiveDataType from '../../core/data-types/PrimitiveDataType';

export default class DateFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.DATE);
  }

  getName(): string {
    return 'date';
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

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any
  ): any {
    if (typeof value === 'string' && DateUtils.isIsoDate(value)) {
      const date = new Date(value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
    return value;
  }

  async getDisplayValue(
    schema: Schema,
    fieldName: string,
    record: any,
    context: any
  ) {
    return this.getDataType().toJSON(record[fieldName]);
  }
}
