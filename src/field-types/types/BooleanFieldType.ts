import DataType from "../../core/data-types/dataType.interface";
import FieldType from "../FieldType.interface";
import BooleanDataType from "../../core/data-types/types/booleanDataType";
import Schema from "../../collection/Schema";
import Field from "../../collection/Field";
import FieldTypeUtils from "../FieldTypeUtils";
import ODM from "../../ODM";

export default class BooleanFieldType extends FieldType {

    #dataType: DataType = new BooleanDataType();

    #odm?: ODM;

    setODM(odm: ODM) {
        this.#odm = odm;
    }

    getDataType(): DataType {
        return this.#dataType;
    }

    getType(): string {
        return "boolean"
    }

    async validateValue(schema: Schema, field: Field, value: any, context: any) {
        FieldTypeUtils.requiredValidation(schema, field, value);
        await FieldTypeUtils.uniqueValidation(this.#odm, schema, field, value);
    }

    validateDefinition(fieldDefinition: any): boolean {
        return !!fieldDefinition.name
    }

    async getDisplayValue(schema: any, field: Field, record: any, context: any) {
        return record[field.getName()];
    }

    getValueIntercept(schema: Schema, field: Field, record: any, context: any): any {
        return record[field.getName()];
    }

    setValueIntercept(schema: Schema, field: Field, newValue: any, record: any, context: any): any {
        return newValue;
    }

}
