import FieldType from './FieldType.interface';

export default class FieldTypeRegistry {
  fieldTypes: Map<string, FieldType>;

  constructor() {
    this.fieldTypes = new Map<string, FieldType>();
  }

  addFieldType = (fieldType: FieldType): Map<string, FieldType> =>
    this.fieldTypes.set(fieldType.getType(), fieldType);

  deleteFieldType = (type: string): boolean => this.fieldTypes.delete(type);

  getFieldType = (type: string): FieldType | undefined =>
    this.fieldTypes.get(type);
}
