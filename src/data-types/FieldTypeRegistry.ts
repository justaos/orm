import DataType from "./DataType.ts";

export default class FieldTypeRegistry {
  fieldTypes: Map<string, DataType>;

  constructor() {
    this.fieldTypes = new Map<string, DataType>();
  }

  addFieldType = (fieldType: DataType): Map<string, DataType> =>
    this.fieldTypes.set(fieldType.getName(), fieldType);

  deleteFieldType = (type: string): boolean => this.fieldTypes.delete(type);

  getFieldType = (type: string): DataType | undefined =>
    this.fieldTypes.get(type);
}
