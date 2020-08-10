import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import IntegerDataType from "../../core/data-types/integerDataType";

export default class IntegerFieldType implements FieldType {

    #dataType: DataType = new IntegerDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "integer"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: any) {
        return value
    }
}
