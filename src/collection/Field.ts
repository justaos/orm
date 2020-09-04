import FieldType from "../field-types/FieldType.interface";
import Schema from "./Schema";
import FieldValidationError from "../errors/FieldValidationError";

export default class Field {

    #schema: Schema;

    #fieldDefinition: any;

    #fieldType: FieldType | undefined;

    constructor(schema: Schema, fieldDefinition: any, fieldType?: FieldType) {
        this.#fieldDefinition = fieldDefinition;
        this.#fieldType = fieldType;
        this.#schema = schema;
    }

    getName(): string {
        return this.#fieldDefinition.name;
    }

    getDefinition(): any {
        return this.#fieldDefinition;
    }

    getType(): string {
        return this.#fieldDefinition.type;
    }

    getDefaultValue(): any {
        return this.#fieldDefinition.default_value;
    }

    getFieldType(): FieldType {
        if (!this.#fieldType)
            throw new Error("Field type not found");
        return this.#fieldType;
    }

    validate() {
        if (!this.#fieldDefinition || !this.getType())
            throw new Error(`field type not provided`);
        if (!this.#fieldType)
            throw new Error(`[Field :: ${this.getName()}] [Type :: ${this.getType()}] No such field type`);
        if (!this.#fieldType.validateDefinition(this.#fieldDefinition))
            throw new Error(`[Field :: ${this.getName()}] [Type :: ${this.getType()}] Invalid field definition`);
    }

    async validateValue(recordObject: any, context: any) {
        const value = recordObject[this.getName()];
        if (!this.#fieldType?.getDataType().validateType(value))
            throw new FieldValidationError(this.getDefinition(), value, 'NOT_VALID_TYPE');
        try {
            await this.#fieldType?.validateValue(this.#schema, this, recordObject, context);
        } catch (e) {
            throw new FieldValidationError(this.getDefinition(), value, e.message);
        }
    }

}