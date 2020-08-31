import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import DateDataType from "../../core/data-types/types/dateDataType";
import Schema from "../../collection/Schema";
import {isIsoDate} from "../../utils";
import Field from "../../collection/Field";

export default class DateFieldType implements FieldType {

    #dataType: DataType = new DateDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "date"
    }

    async validateValue(fieldDefinition: any, value: any) {
        if (fieldDefinition.required && value === null)
            throw new Error("REQUIRED");
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    getValueIntercept(schema: Schema, field: Field, value: any): any {
        return value;
    }

    setValueIntercept(schema: Schema, field: Field, value: any): any {
        if (typeof value === "string" && isIsoDate(value)) {
            const date = new Date(value);
            date.setUTCHours(0, 0, 0, 0);
            return date;
        }
        return value;
    }

    async getDisplayValue(schema: Schema, field: Field, value: any) {
        return this.#dataType.toJSON(value);
    }

}
