import FieldTypeRegistry from "./field-types/FieldTypeRegistry";
import FieldType from "./field-types/FieldType.interface";
import CollectionDefinitionRegistry from "./collection/CollectionDefinitionRegistry";
import Collection from "./collection/Collection";

const privates = new WeakMap();

export default class Schema {

    constructor(schemaObject: any, fieldTypeRegistry: FieldTypeRegistry, collectionDefinitionRegistry: CollectionDefinitionRegistry) {
        privates.set(this, {fieldTypeRegistry, collectionDefinitionRegistry, schema: schemaObject});
        _validateSchemaObject(this);
        _populateFieldsWithDataType(this);
    }

    getName(): string {
        return _getSchemaObject(this).name;
    }

    getExtends(): string {
        return _getSchemaObject(this).extends;
    }

    getExtendsStack(): string[] {
        let extendsStack = [this.getName()];
        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName)
            extendsStack = extendsStack.concat(_getCollection(this, extendsCollectionName).getSchema().getExtendsStack());
        return extendsStack;
    }

    isFinal(): boolean {
        return !!_getSchemaObject(this).final;
    }

    getBaseName(): string {
        let hostName = this.getName();
        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName) {
            const extendedSchema = _getCollection(this, extendsCollectionName).getSchema();
            hostName = extendedSchema.getName();
        }
        return hostName;
    }

    getFields(): any[] {
        let allFields: any[] = [];

        const fields = _getFields(this);
        if (fields)
            allFields = allFields.concat(fields);

        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName) {
            const extendedSchema = _getCollection(this, extendsCollectionName).getSchema();
            allFields = allFields.concat(extendedSchema.getFields());
        } else {
            allFields.push({
                name: '_id',
                type: 'objectId',
                dataType: 'objectId'
            }, {
                name: '_collection',
                type: 'string',
                dataType: 'string'
            });
        }
        return allFields;
    }

    getField(name: string): any {
        if (name === '_id')
            return {
                name: '_id',
                type: 'objectId',
                dataType: 'objectId'
            };
        else if (name === '_collection')
            return {
                name: '_collection',
                type: 'string',
                dataType: 'string'
            };
        const fields = _getFields(this);
        for (let field of fields) {
            if (field.name === name)
                return field;
        }
        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName) {
            const extendedSchema = _getCollection(this, extendsCollectionName).getSchema();
            return extendedSchema.getField(name);
        }
    }

    getFieldType(name: string): FieldType | undefined {
        const field = this.getField(name);
        return _getFieldType(this, field.type);
    }

    validate(recordObject: any) {
        const that = this;
        const errorMessages: string[] = [];
        for (let field of this.getFields()) {
            if (field.name === '_id' || field.name === '_collection')
                continue;
            let fieldType = _getFieldType(that, field.type);
            if (!fieldType)
                throw Error("Field type should be defined");
            try {
                fieldType.getDataType(field).validate(recordObject[field.name]);
            } catch (err) {
                if (err.message === "REQUIRED")
                    errorMessages.push(field.name + " is a required field");
                else if (err.message === "NOT_VALID_TYPE")
                    errorMessages.push(field.name + " should be a " + fieldType.getType());
                else
                    errorMessages.push(field.name + " should be a valid " + fieldType.getType());
            }
        }
        if (errorMessages.length)
            throw new Error(errorMessages.join(", \n"));
    }

}

function _validateSchemaError(message: string): Error {
    return new Error("[Schema::_validateSchemaJSON] " + message)
}

function _validateSchemaObject(that: Schema) {
    const schemaObject = _getSchemaObject(that);
    if (!schemaObject)
        throw _validateSchemaError("Schema not provided");
    if (!schemaObject.name)
        throw  _validateSchemaError("Collection name not provided");
    if (typeof schemaObject.name !== 'string')
        throw  _validateSchemaError("Collection name should be a string - [collectionName=" + schemaObject.name + "]");
    if (!(/^[a-z0-9_]+$/i.test(schemaObject.name)))
        throw  _validateSchemaError("Collection name should be alphanumeric - [collectionName=" + schemaObject.name + "]");
    if (_hasCollection(that, schemaObject.name))
        throw  _validateSchemaError("Collection name already exists");
    if (schemaObject.extends) {
        let extendsCol: Collection | null;
        extendsCol = _getCollection(that, schemaObject.extends);
        if (!extendsCol)
            throw _validateSchemaError("'" + schemaObject.name + "' cannot extend '" + schemaObject.extends + "'. '" + schemaObject.extends + "' does not exists.");
        if (extendsCol.getSchema().isFinal())
            throw _validateSchemaError("'" + schemaObject.name + "' cannot extend '" + schemaObject.extends + "'. '" + schemaObject.extends + "' is final schema .");
    }

    const allFieldsObjects = that.getFields();
    for (const fieldObject of allFieldsObjects) {
        if (!fieldObject || !fieldObject.type)
            throw _validateSchemaError("field type provided - [collectionName=" + schemaObject.name + "]");
        const fieldType = _getFieldType(that, fieldObject.type);
        if (!fieldType)
            throw _validateSchemaError("No such field type  - [collectionName=" + schemaObject.name + ", fieldName=" + fieldObject.name + ", fieldType=" + fieldObject.type + "]");
        if (!fieldType.validateDefinition(fieldObject))
            throw _validateSchemaError("Invalid field definition  [collectionName=" + schemaObject.name + ", fieldName=" + fieldObject.name + "]");
    }

    const fieldNames: string[] = allFieldsObjects.map((f: any) => f.name);
    if (_areDuplicatesPresent(fieldNames))
        throw _validateSchemaError("Duplicate field name [collectionName=" + schemaObject.name + ", fieldNames=" + fieldNames + "]");
}

function _populateFieldsWithDataType(that: Schema) {
    let fields = _getFields(that);
    if (fields)
        for (let field of fields) {
            const fieldType: any = _getFieldType(that, field.type);
            if (!fieldType)
                throw Error("Field type should be defined");
            field.dataType = fieldType.getDataType(field).type;
        }
}

function _areDuplicatesPresent(a: string[]): boolean {
    for (let i = 0; i <= a.length; i++)
        for (let j = i; j <= a.length; j++)
            if (i != j && a[i] == a[j])
                return true;
    return false;
}

function _getSchemaObject(that: Schema): any {
    return privates.get(that).schema;
}

function _getFields(that: Schema): any {
    return _getSchemaObject(that).fields;
}


function _getFieldTypeRegistry(that: Schema): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getFieldType(that: Schema, type: string): FieldType | undefined {
    return _getFieldTypeRegistry(that).getFieldType(type);
}

function _getCollectionDefinitionRegistry(that: Schema): CollectionDefinitionRegistry {
    return privates.get(that).collectionDefinitionRegistry;
}

function _getCollection(that: Schema, collectionName: string): Collection {
    const collectionDefinition = _getCollectionDefinitionRegistry(that).getCollectionDefinition(collectionName);
    if (!collectionDefinition)
        throw Error("[Schema::_getCollection] Collection not found");
    return new Collection(collectionDefinition);
}

function _hasCollection(that: Schema, collectionName: string): boolean {
    return _getCollectionDefinitionRegistry(that).hasCollectionDefinition(collectionName);
}
