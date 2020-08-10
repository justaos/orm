import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import DateDataType from "../../core/data-types/dateDataType";

export default class DateFieldType implements FieldType {

    #dataType: DataType = new DateDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "date"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, fieldDefinition: any, value: any) {
        return this.#dataType.toJSON(value);
    }
}
