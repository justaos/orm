import DataType from "../../core/data-types/dataType.interface";
import StringDataType from "../../core/data-types/types/stringDataType";
import FieldType from "../FieldType.interface";
import Schema from "../../collection/Schema";

export default class StringFieldType implements FieldType {

    #dataType: DataType = new StringDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "string"
    }

    async validateValue(fieldDefinition: any, value: any) {
        if (fieldDefinition.required && value === null)
            throw new Error("REQUIRED");
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: string) {
        return value
    }

    getValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        return value;
    }

    setValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        return value;
    }
}
