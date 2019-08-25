import Query from "./query/query";
import Record from "./record/record";
import FieldTypeRegistry from "./field-types/field-type-registry";

const privates = new WeakMap();

export default class Model {

    constructor(schema: any, getCollection: any, fieldTypeRegistry: FieldTypeRegistry) {
        privates.set(this, {schema});
        _validateSchema(schema, fieldTypeRegistry);
        privates.get(this).collection = getCollection(this);
    }

    getName() {
        return this.getSchema().name;
    }

    getSchema() {
        return privates.get(this).schema;
    }

    initializeRecord() {
        return new Record(null, this, _getCollection(this)).initialize();
    }

    findById(id: string) {
        return this.initializeQuery().findById(id);
    }

    find(conditions: any) {
        return this.initializeQuery().find(conditions);
    }

    initializeQuery() {
        return new Query(this, _getCollection(this));
    }

}

function _validateSchemaError(mesg: string) {
    return new Error("[ModelService::_validateSchema] " + mesg)
}

function _validateSchema(schema: any, fieldTypeRegistry: FieldTypeRegistry) {
    if (!schema)
        throw new Error("Model::validate definition not provided");
    if (!schema.name)
        throw new Error("ModelService::validateSchema invalid model name");
    if (schema.fields) {
        for (const field of schema.fields) {
            if (!field || !field.type)
                throw _validateSchemaError("field type provided - [modelName=" + schema.name + "]");
            let fieldType = fieldTypeRegistry.getFieldType(field.type);
            if (!fieldType)
                throw _validateSchemaError("No such field type  - [modelName=" + schema.name + ", fieldName=" + field.name + ", fieldType=" + field.type + "]");
            if (!fieldType.validateDefinition(field))
                throw _validateSchemaError("Invalid field definition  [modelName=" + schema.name + ", fieldName=" + field.name + "]");
        }
        const fieldNames = schema.fields.map((f: any) => f.name);
        if (_areDuplicatesPresent(fieldNames))
            throw _validateSchemaError("Duplicate field name [modelName=" + schema.name + ", fieldNames=" + fieldNames + "]");
    }
    return false;
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
