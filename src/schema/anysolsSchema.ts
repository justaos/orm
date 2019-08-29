import FieldTypeRegistry from "../field-types/fieldTypeRegistry";
import * as Ajv from "ajv";
import FieldType from "../field-types/fieldType";

const privates = new WeakMap();

export default class AnysolsSchema {

    constructor(schemaObject: any, fieldTypeRegistry: FieldTypeRegistry) {
        privates.set(this, {fieldTypeRegistry});
        _validateSchemaJSON(this, schemaObject);
        privates.set(this, {
            ...privates.get(this),
            ...{name: schemaObject.name, fields: schemaObject.fields}
        });
    }

    getName() {
        return privates.get(this).name;
    }

    getFields(): any[] {
        return privates.get(this).fields;
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

function _validateSchemaJSON(that: AnysolsSchema, schemaJson: any) {
    if (!schemaJson)
        throw _validateSchemaError("AnysolsSchema not provided");
    if (!schemaJson.name)
        throw  _validateSchemaError("Invalid collection name");
    if (schemaJson.hasOwnProperty('fields') && !!schemaJson['fields']) {
        for (const fieldDef of schemaJson['fields']) {
            if (!fieldDef || !fieldDef.type)
                throw _validateSchemaError("field type provided - [collectionName=" + schemaJson.name + "]");
            let fieldType = _getFieldType(that, fieldDef.type);
            if (!fieldType)
                throw _validateSchemaError("No such field type  - [collectionName=" + schemaJson.name + ", fieldName=" + fieldDef.name + ", fieldType=" + fieldDef.type + "]");
            if (!fieldType.validateDefinition(fieldDef))
                throw _validateSchemaError("Invalid field definition  [collectionName=" + schemaJson.name + ", fieldName=" + fieldDef.name + "]");
        }
        const fieldNames = schemaJson.fields.map((f: any) => f.name);
        if (_areDuplicatesPresent(fieldNames))
            throw _validateSchemaError("Duplicate field name [collectionName=" + schemaJson.name + ", fieldNames=" + fieldNames + "]");
    }
}

function _areDuplicatesPresent(a: []): boolean {
    for (let i = 0; i <= a.length; i++)
        for (let j = i; j <= a.length; j++)
            if (i != j && a[i] == a[j])
                return true;
    return false;
}

function _getFieldTypeRegistry(that: AnysolsSchema): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getFieldType(that: AnysolsSchema, type: string): FieldType | undefined {
    return _getFieldTypeRegistry(that).getFieldType(type);
}
