import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import Schema from "../../collection/Schema";
import NumberDataType from "../../core/data-types/types/numberDataType";

export default class NumberFieldType implements FieldType {

    #dataType: DataType = new NumberDataType();

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "number"
    }

    async validateValue(fieldDefinition: any, value: null | number) {
        if (value === null) {
            if (fieldDefinition.required)
                throw new Error("REQUIRED");
        } else {
            if (!Number.isNaN(fieldDefinition.maximum) && fieldDefinition.maximum > value)
                throw new Error(`should be less than ${fieldDefinition.maximum}`);
            if (!Number.isNaN(fieldDefinition.minimum) && fieldDefinition.minimum > value)
                throw new Error(`should be more than ${fieldDefinition.minimum}`);
        }
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: Schema, fieldDefinition: any, value: any) {
        return value
    }

    getValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        return value;
    }

    setValueIntercept(schema: Schema, fieldDefinition: any, value: any): any {
        return value;
    }
}
