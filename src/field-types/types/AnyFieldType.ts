import DataType from '../../core/data-types/dataType.interface';
import FieldType from '../FieldType.interface';
import Schema from '../../collection/Schema';
import AnyDataType from '../../core/data-types/types/anyDataType';
import FieldTypeUtils from '../FieldTypeUtils';
import ODM from '../../ODM';
import Field from '../../collection/Field';

export default class AnyFieldType extends FieldType {
  #dataType: DataType = new AnyDataType();

  #odm?: ODM;

  setODM(odm: ODM) {
    this.#odm = odm;
  }

  getDataType(): DataType {
    return this.#dataType;
  }

  getType(): string {
    return 'any';
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async validateValue(schema: Schema, field: Field, record: any, context: any) {
    FieldTypeUtils.requiredValidation(schema, field, record);
    await FieldTypeUtils.uniqueValidation(this.#odm, schema, field, record);
  }

  async getDisplayValue(schema: any, field: Field, record: any, context: any) {
    return record[field.getName()];
  }

  getValueIntercept(
    schema: Schema,
    field: Field,
    record: any,
    context: any,
  ): any {
    return record[field.getName()];
  }

  setValueIntercept(
    schema: Schema,
    field: Field,
    newValue: any,
    record: any,
    context: any,
  ): any {
    return newValue;
  }
}
