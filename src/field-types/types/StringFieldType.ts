import DataType from "../../core/data-types/dataType.interface";
import StringDataType from "../../core/data-types/stringDataType";
import FieldType from "../FieldType.interface";

export default class StringFieldType implements FieldType {

    getDataType(): DataType {
        return new StringDataType();
    }

    getType(): string {
        return "string"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(fieldDefinition: any, value: string) {
        return value
    }
}
