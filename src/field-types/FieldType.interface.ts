import DataType from '../core/data-types/dataType.interface';
import Schema from '../collection/Schema';
import Field from '../collection/Field';
import ODM from '../ODM';

export default abstract class FieldType {
  abstract setODM(odm: ODM): void;

  abstract getDataType(): DataType;

  abstract getType(): string;

  abstract validateDefinition(fieldDefinition: any): boolean;

  abstract getValueIntercept(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ): any;

  abstract setValueIntercept(
    schema: Schema,
    field: Field,
    newValue: any,
    record: any,
    context: any
  ): any;

  abstract async getDisplayValue(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ): Promise<any>;

  abstract async validateValue(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ): Promise<any>;
}
