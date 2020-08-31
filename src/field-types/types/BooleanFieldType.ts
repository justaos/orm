import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import BooleanDataType from "../../core/data-types/types/booleanDataType";
import Schema from "../../collection/Schema";
import Field from "../../collection/Field";

export default class BooleanFieldType implements FieldType {

    #dataType: DataType = new BooleanDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "boolean"
    }

    async validateValue(fieldDefinition: any, value: any) {
        if (fieldDefinition.required && value === null)
            throw new Error("REQUIRED");
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    getValueIntercept(schema: Schema, field: Field, value: any): any {
        return value;
    }

    setValueIntercept(schema: Schema, field: Field, value: any): any {
        return value;
    }

    async getDisplayValue(schema: Schema, field: Field, value: boolean) {
        return value
    }

}
