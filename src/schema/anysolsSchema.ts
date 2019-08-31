import FieldTypeRegistry from "../field-types/fieldTypeRegistry";
import * as Ajv from "ajv";
import FieldType from "../field-types/fieldType.interface";
import AnysolsCollectionRegistry from "../collection/anysolsCollectionRegistry";
import AnysolsCollection from "../collection/anysolsCollection";

const privates = new WeakMap();

export default class AnysolsSchema {

    constructor(schemaObject: any, fieldTypeRegistry: FieldTypeRegistry, anysolsCollectionRegistry: AnysolsCollectionRegistry) {
        privates.set(this, {fieldTypeRegistry, anysolsCollectionRegistry, schema: schemaObject});
        _validateSchemaObject(this);
    }

    getName(): string {
        return _getSchemaObject(this).name;
    }

    getFields(): any[] {
        const schemaObject: any = _getSchemaObject(this);
        let allFields: any[] = [];
        if (schemaObject.fields)
            allFields = allFields.concat(schemaObject.fields);
        if (schemaObject.extends) {
            let extendedSchema = _getAnysolsCollection(this, schemaObject.extends).getSchema();
            allFields = allFields.concat(extendedSchema.getFields());
        }
        return allFields;
    }

    validate(recordObject: any) {
        const that = this;
        const jsonSchema = _getAVJJsonSchema(this);
        const validate = new Ajv().compile(jsonSchema);
        const formattedRecord: any = {};
        for (let field of this.getFields()) {
            let fieldType = _getFieldType(that, field.type);
            if (!fieldType)
                throw Error("Field type should be defined");
            formattedRecord[field.name] = fieldType.getDataType(field).format(recordObject[field.name]);
        }
        if (!validate(formattedRecord))
            return validate.errors;
    }

}

function _getAVJJsonSchema(that: AnysolsSchema) {
    const jsonSchema: any = {
        "type": "object",
        "properties": {},
        "required": []
    };
    for (let fieldDef of that.getFields()) {
        let fieldType = _getFieldType(that, fieldDef.type);
        if (!fieldType)
            throw Error("Field type should be defined");
        jsonSchema.properties[fieldDef.name] = fieldType.getDataType(fieldDef).transform();
    }
    return jsonSchema;
}

function _validateSchemaError(message: string): Error {
    return new Error("[AnysolsSchema::_validateSchemaJSON] " + message)
}

function _validateSchemaObject(that: AnysolsSchema) {
    const schemaObject = _getSchemaObject(that);
    if (!schemaObject)
        throw _validateSchemaError("Schema not provided");
    if (!schemaObject.name)
        throw  _validateSchemaError("Collection name not provided");
    if (typeof schemaObject.name !== 'string')
        throw  _validateSchemaError("Collection name should be a string - [collectionName=" + schemaObject.name + "]");
    if (!(/^[a-z0-9]+$/i.test(schemaObject.name)))
        throw  _validateSchemaError("Collection name should be alphanumeric - [collectionName=" + schemaObject.name + "]");
    if (_hasAnysolsCollection(that, schemaObject.name))
        throw  _validateSchemaError("Collection name already exists");
    if (schemaObject.extends) {
        if (!_hasAnysolsCollection(that, schemaObject.extends))
            throw _validateSchemaError("'" + schemaObject.name + "' cannot extend '" + schemaObject.extends + "'. '" + schemaObject.extends + "' does not exists.");
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

function _areDuplicatesPresent(a: string[]): boolean {
    for (let i = 0; i <= a.length; i++)
        for (let j = i; j <= a.length; j++)
            if (i != j && a[i] == a[j])
                return true;
    return false;
}

function _getSchemaObject(that: AnysolsSchema): any {
    return privates.get(that).schema;
}

function _getFieldTypeRegistry(that: AnysolsSchema): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getFieldType(that: AnysolsSchema, type: string): FieldType | undefined {
    return _getFieldTypeRegistry(that).getFieldType(type);
}

function _getAnysolsCollectionRegistry(that: AnysolsSchema): AnysolsCollectionRegistry {
    return privates.get(that).anysolsCollectionRegistry;
}

function _getAnysolsCollection(that: AnysolsSchema, collectionName: string): AnysolsCollection {
    const anysolsCollection = _getAnysolsCollectionRegistry(that).getCollection(collectionName);
    if (!anysolsCollection)
        throw Error("[AnysolsSchema::_getAnysolsCollection] Collection not found");
    return anysolsCollection;
}

function _hasAnysolsCollection(that: AnysolsSchema, collectionName: string): boolean {
    return _getAnysolsCollectionRegistry(that).hasCollection(collectionName);
}
