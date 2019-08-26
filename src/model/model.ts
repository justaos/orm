import Query from "./query/query";
import Record from "./record/record";
import FieldTypeRegistry from "./field-types/field-type-registry";
import * as Ajv from "ajv";

const privates = new WeakMap();

export default class Model {

    constructor(schema: any, getCollection: any, fieldTypeRegistry: FieldTypeRegistry) {
        privates.set(this, {schema, fieldTypeRegistry});
        _validateSchema(this, schema);
        privates.get(this).collection = getCollection(this);
    }

    getName() {
        return this.getSchema().name;
    }

    getSchema() {
        return privates.get(this).schema;
    }

    initializeRecord() {
        return new Record(null, this).initialize();
    }

    findById(id: string) {
        return this.initializeQuery().findById(id);
    }

    find(conditions: any) {
        return this.initializeQuery().find(conditions);
    }

    async insertOne(recordObject: any) {
        const errors = this.validate(recordObject);
        if (errors)
            throw errors;
        const response = await _getCollection(this).insertOne(recordObject);
        const savedRecord = response.ops.find(() => true);
        return response;
    }

    validate(recordObject: any) {
        const jsonSchema = _getJsonSchema(this);
        const validate = new Ajv().compile(jsonSchema);
        if (!validate(recordObject))
            return validate.errors;
    }

    initializeQuery() {
        return new Query(this, _getCollection(this));
    }

}

function _validateSchemaError(mesg: string) {
    return new Error("[ModelService::_validateSchema] " + mesg)
}

function _validateSchema(that: Model, schema: any) {
    if (!schema)
        throw _validateSchemaError("Definition not provided");
    if (!schema.name)
        throw  _validateSchemaError("Invalid model name");
    if (schema.fields) {
        for (const field of schema.fields) {
            if (!field || !field.type)
                throw _validateSchemaError("field type provided - [modelName=" + schema.name + "]");
            let fieldType = _getFieldTypeRegistry(that).getFieldType(field.type);
            if (!fieldType)
                throw _validateSchemaError("No such field type  - [modelName=" + schema.name + ", fieldName=" + field.name + ", fieldType=" + field.type + "]");
            if (!fieldType.validateDefinition(field))
                throw _validateSchemaError("Invalid field definition  [modelName=" + schema.name + ", fieldName=" + field.name + "]");
        }
        const fieldNames = schema.fields.map((f: any) => f.name);
        if (_areDuplicatesPresent(fieldNames))
            throw _validateSchemaError("Duplicate field name [modelName=" + schema.name + ", fieldNames=" + fieldNames + "]");
    }
}

function _areDuplicatesPresent(a: []): boolean {
    for (let i = 0; i <= a.length; i++)
        for (let j = i; j <= a.length; j++)
            if (i != j && a[i] == a[j])
                return true;
    return false;
}

function _getCollection(that: Model) {
    return privates.get(that).collection;
}

function _getFieldTypeRegistry(that: Model) {
    return privates.get(that).fieldTypeRegistry;
}

function _getJsonSchema(that: Model) {
    const schema = that.getSchema();

    const jsonSchema: any = {
        "type": "object",
        "properties": {},
        "required": []
    };
    for (let field of schema.fields) {
        let fieldType = _getFieldTypeRegistry(that).getFieldType(field.type);
        jsonSchema.properties[field.name] = fieldType.getDataType(field).transform();
    }
    return jsonSchema;

}
