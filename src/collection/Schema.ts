import FieldTypeRegistry from "../field-types/FieldTypeRegistry";
import CollectionDefinitionRegistry from "./CollectionDefinitionRegistry";
import {findDuplicates} from "../utils";
import Field from "./Field";


export default class Schema {

    #name: string;

    #final: boolean;

    #extends: string;

    #fields: Field[] = [];

    #fieldTypeRegistry: FieldTypeRegistry;

    #collectionDefinitionRegistry: CollectionDefinitionRegistry;


    constructor(schemaDefinition: any, fieldTypeRegistry: FieldTypeRegistry, collectionDefinitionRegistry: CollectionDefinitionRegistry) {
        this.#fieldTypeRegistry = fieldTypeRegistry;
        this.#collectionDefinitionRegistry = collectionDefinitionRegistry;
        this.#name = schemaDefinition.name;
        this.#final = !!schemaDefinition.final;
        this.#extends = schemaDefinition.extends;
        if (schemaDefinition.fields && schemaDefinition.fields.length) {
            schemaDefinition.fields.forEach((fieldDefinition: any) => {
                this.#fields.push(new Field(fieldDefinition, this.#fieldTypeRegistry.getFieldType(fieldDefinition.type)))
            });
        }

        this.validate();
    }

    getName(): string {
        return this.#name;
    }

    getExtends(): string {
        return this.#extends;
    }

    isFinal(): boolean {
        return this.#final;
    }

    getExtendsStack(): string[] {
        let extendsStack = [this.getName()];
        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName)
            extendsStack = extendsStack.concat(_getSchema(this.#collectionDefinitionRegistry, extendsCollectionName).getExtendsStack());
        return extendsStack;
    }


    getBaseName(): string {
        let hostName = this.getName();
        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName) {
            const extendedSchema = _getSchema(this.#collectionDefinitionRegistry, extendsCollectionName);
            hostName = extendedSchema.getBaseName();
        }
        return hostName;
    }

    getFields(): Field[] {
        let allFields: Field[] = [];

        allFields = allFields.concat(this.#fields);

        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName) {
            const extendedSchema = _getSchema(this.#collectionDefinitionRegistry, extendsCollectionName);
            allFields = allFields.concat(extendedSchema.getFields());
        } else {
            allFields.push(new Field({
                    name: '_id',
                    type: 'objectId',
                    dataType: 'objectId'
                }, this.#fieldTypeRegistry.getFieldType('objectId')),
                new Field({
                    name: '_collection',
                    type: 'string',
                    dataType: 'string'
                }, this.#fieldTypeRegistry.getFieldType('string')));
        }
        return allFields;
    }

    getField(name: string): Field | undefined {
        return this.getFields().find((field: Field) => {
            return field.getName() === name;
        });
    }

    async validateRecord(recordObject: any) {
        const errorMessages: string[] = [];
        for (let field of this.getFields()) {
            try {
                await field.validateValue(recordObject[field.getName()]);
            } catch (err) {
                errorMessages.push(err.message);
            }
        }
        if (errorMessages.length)
            throw new Error(`[${this.getName()}] :: ` + errorMessages.join(", \n\t"));
    }

    private validate() {
        if (!this.getName())
            throw  new Error("Collection name not provided :: " + this.getName() + " :: " + this.getExtends());
        if (typeof this.getName() !== 'string')
            throw new Error(`[Collection :: ${this.getName()}] Collection name should be a string`);
        if (!(/^[a-z0-9_]+$/i.test(this.getName())))
            throw new Error(`[Collection :: ${this.getName()}] Collection name should be alphanumeric`);
        if (this.#collectionDefinitionRegistry.hasCollectionDefinition(this.getName()))
            throw new Error(`[Collection :: ${this.getName()}] Collection name already exists`);
        if (this.getExtends()) {
            if (!this.#collectionDefinitionRegistry.hasCollectionDefinition(this.getExtends()))
                throw new Error(`[Collection :: ${this.getName()}] cannot extend '${this.getExtends()}'. '${this.getExtends()}' does not exists.`);
            let extendsCol: Schema;
            extendsCol = _getSchema(this.#collectionDefinitionRegistry, this.getExtends());
            if (extendsCol.isFinal())
                throw new Error(`[Collection :: ${this.getName()}] cannot extend '${this.getExtends()}'. '${this.getExtends()}' is final schema.`);
        }

        const allFields = this.getFields();
        for (const fieldObject of allFields) {
            try {
                fieldObject.validate();
            } catch (err) {
                throw new Error(`[Collection :: ${this.getName()}] ${err.message}`);
            }
        }


        const fieldNames: string[] = allFields.map((f: Field) => f.getName());
        const duplicates = findDuplicates(fieldNames);
        if (duplicates.length)
            throw new Error(`[Collection :: ${this.getName()}] Duplicate fields -> ${duplicates.join(',')}`);
    }

}


function _getSchema(collectionDefinitionRegistry: CollectionDefinitionRegistry, schemaName: string): Schema {
    const collectionDefinition = collectionDefinitionRegistry.getCollectionDefinition(schemaName);
    if (!collectionDefinition)
        throw Error("[Schema::_getCollection] Collection not found");
    return collectionDefinition.getSchema();
}

