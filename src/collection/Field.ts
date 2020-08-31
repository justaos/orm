import FieldType from "../field-types/FieldType.interface";

export default class Field {

    #fieldDefinition: any;

    #fieldType: FieldType | undefined;

    constructor(fieldDefinition: any, fieldType?: FieldType) {
        this.#fieldDefinition = fieldDefinition;
        this.#fieldType = fieldType;
    }

    getName(): string {
        return this.#fieldDefinition.name;
    }


    getType(): string {
        return this.#fieldDefinition.type;
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

    async validateValue(value: any) {
        if (!this.#fieldType?.getDataType().validateType(value))
            throw new Error(`${this.getName()} should be a ${this.getType()}`);

        try {
            await this.#fieldType?.validateValue(this.#fieldDefinition, value);
        } catch (e) {
            if (e.message === 'REQUIRED')
                throw new Error(`${this.getName()}  is required field`);
            else
                throw new Error(`${this.getName()}  ${e.message}`);
        }

    }

}