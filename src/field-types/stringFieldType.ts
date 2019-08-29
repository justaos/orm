import DataType from "../core/data-types/dataType";
import StringDataType from "../core/data-types/stringDataType";
import FieldType from "./fieldType";

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
