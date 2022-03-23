import DataType from '../../core/data-types/dataType.interface';
import FieldType from '../FieldType.interface';
import DateDataType from '../../core/data-types/types/dateDataType';
import Schema from '../../collection/Schema';
import Field from '../../collection/Field';
import ODM from '../../ODM';
import FieldTypeUtils from '../FieldTypeUtils';
import { DateUtils } from '@justaos/utils';

export default class DateFieldType extends FieldType {
  #dataType: DataType = new DateDataType();

  #odm?: ODM;

  setODM(odm: ODM) {
    this.#odm = odm;
  }

  getDataType(): DataType {
    return this.#dataType;
  }

  getType(): string {
    return 'date';
  }

  async validateValue(schema: Schema, field: Field, record: any, context: any) {
    FieldTypeUtils.requiredValidation(schema, field, record);
    await FieldTypeUtils.uniqueValidation(this.#odm, schema, field, record);
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
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
    if (typeof newValue === 'string' && DateUtils.isIsoDate(newValue)) {
      const date = new Date(newValue);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
    return newValue;
  }

  async getDisplayValue(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ) {
    return this.#dataType.toJSON(record[field.getName()]);
  }
}
