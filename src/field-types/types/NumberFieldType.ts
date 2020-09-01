import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import Schema from "../../collection/Schema";
import NumberDataType from "../../core/data-types/types/numberDataType";
import ODM from "../../ODM";
import FieldTypeUtils from "../FieldTypeUtils";
import Field from "../../collection/Field";


export default class NumberFieldType extends FieldType {

    #dataType: DataType = new NumberDataType();

    #odm?: ODM;

    setODM(odm: ODM) {
        this.#odm = odm;
    }

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "number"
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async validateValue(schema: Schema, field: Field, record: any, context: any) {
        FieldTypeUtils.requiredValidation(schema, field, record);
        await FieldTypeUtils.uniqueValidation(this.#odm, schema, field, record);
        const fieldDefinition = field.getDefinition();
        const value = record[field.getName()];
        if (!Number.isNaN(fieldDefinition.maximum) && fieldDefinition.maximum > value)
            throw new Error(`should be less than ${fieldDefinition.maximum}`);
        if (!Number.isNaN(fieldDefinition.minimum) && fieldDefinition.minimum > value)
            throw new Error(`should be more than ${fieldDefinition.minimum}`);

    }

    async getDisplayValue(schema: Schema, field: Field, record: any, context: any) {
        return record[field.getName()];
    }

    getValueIntercept(schema: Schema, field: Field, record: any, context: any): any {
        return record[field.getName()];
    }

    setValueIntercept(schema: Schema, field: Field, newValue: any, record: any, context: any): any {
        return newValue;
    }
}
