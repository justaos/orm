import DataType from "../data-types/data-type";
import FieldType from "./field-type";
import IntegerDataType from "../data-types/integer-data-type";

export default class IntegerFieldType implements FieldType {

    getDataType(fieldDefinition: any): DataType {
        return new IntegerDataType();
    }

    getType(): string {
        return "integer"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }
}
