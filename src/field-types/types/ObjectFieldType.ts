import DataType from "../../core/data-types/dataType.interface";
import ObjectDataType from "../../core/data-types/types/objectDataType";
import FieldType from "../FieldType.interface";
import Schema from "../../collection/Schema";

export default class ObjectFieldType implements FieldType {

    #dataType: DataType = new ObjectDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "object"
    }

    async validateValue(fieldDefinition: any, value: any) {
        if (fieldDefinition.required && value === null)
            throw new Error("REQUIRED");
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: any) {
        return value
    }

    getValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        return value;
    }

    setValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        return value;
    }
}
