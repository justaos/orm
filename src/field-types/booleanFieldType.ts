import DataType from "../core/data-types/dataType.interface";
import FieldType from "./fieldType.interface";
import BooleanDataType from "../core/data-types/booleanDataType";

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
}
