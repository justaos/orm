import FieldType from "./fieldType";

export default class FieldTypeRegistry {

    fieldTypes: Map<string, FieldType>;

    constructor() {
        this.fieldTypes = new Map<string, FieldType>();
    }

    addFieldType = (fieldType: FieldType) => this.fieldTypes.set(fieldType.getType(), fieldType);

    deleteFieldType = (type: string) => this.fieldTypes.delete(type);

    getFieldType = (type: string) => this.fieldTypes.get(type);

};
