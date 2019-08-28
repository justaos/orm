import DataType from "../data-types/data-type";
import StringDataType from "../data-types/string-data-type";
import FieldType from "./field-type";

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
}
