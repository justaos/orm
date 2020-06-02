import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import BooleanDataType from "../../core/data-types/booleanDataType";

export default class BooleanFieldType implements FieldType {

    getDataType(): DataType {
        return new BooleanDataType();
    }

    getType(): string {
        return "boolean"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: boolean) {
        return value
    }
}
