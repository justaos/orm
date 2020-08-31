import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import DateDataType from "../../core/data-types/types/dateDataType";
import Schema from "../../collection/Schema";
import {isIsoDate} from "../../utils";

export default class DateTimeFieldType implements FieldType {

    #dataType: DataType = new DateDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "datetime"
    }

    async validateValue(fieldDefinition: any, value: any) {
        if (fieldDefinition.required && value === null)
            throw new Error("REQUIRED");
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    getValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        return value;
    }

    setValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        if (typeof value === "string" && isIsoDate(value)) {
            return new Date(value);
        }
        return value;
    }

    async getDisplayValue(schema: Schema, fieldDefinition: any, value: any) {
        return this.#dataType.toJSON(value);
    }

}

