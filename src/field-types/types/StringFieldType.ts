import DataType from "../../core/data-types/dataType.interface";
import StringDataType from "../../core/data-types/stringDataType";
import FieldType from "../FieldType.interface";

export default class StringFieldType implements FieldType {

    #dataType: DataType = new StringDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "string"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: string) {
        return value
    }
}
