import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import Schema from "../../collection/Schema";
import AnyDataType from "../../core/data-types/types/anyDataType";

export default class AnyFieldType implements FieldType {

    #dataType: DataType = new AnyDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "any"
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
