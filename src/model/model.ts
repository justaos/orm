import Query from "./query/query";

const privates = new WeakMap();

export default class Model {

    constructor(definition: any, getCollection: any, getFieldType: any) {
        privates.set(this, {definition, getCollection, getFieldType});
        _validate(this, definition);
    }

    getName() {
        return privates.get(this).definition.name;
    }

    findById(id: string) {
        return new Query(_getCollection(this)).findById(id);
    }

    find(conditions: any) {
        return new Query(_getCollection(this)).find(conditions);
    }

}

function _validate(that: Model, modelDefinition: any) {
    if (!modelDefinition)
        throw new Error("Model::validate definition not provided");
    if (!modelDefinition.name)
        throw new Error("ModelService::validateSchema invalid model name");
    if (modelDefinition.fields) {
        for (const field of modelDefinition.fields) {
            if (!field || !field.name || !field.type)
                throw new Error("ModelService::validateSchema field name or type are provided - " + modelDefinition.name);
            let fieldDefinition = _getFieldType(that, field.type);
            if (!fieldDefinition)
                throw new Error("ModelService::validateSchema no such field type :: " + modelDefinition.name + " :: " + field.name);
            /*if (!fieldDefinition.validate(field))
                throw new Error("ModelService::validateSchema invalid field definition :: " + modelDefinition.name + " :: " + field.name);*/
        }
        const fieldNames = modelDefinition.fields.map((f: any) => f.name);
        if (_areDuplicatesPresent(fieldNames))
            throw new Error("ModelService::validateSchema duplicate field name" + fieldNames);
    }
    return false;
}

function _areDuplicatesPresent(a: []) {
    for (let i = 0; i <= a.length; i++)
        for (let j = i; j <= a.length; j++)
            if (i != j && a[i] == a[j])
                return true;
    return false;
}

function _getFieldType(that: Model, type: string) {
    return privates.get(that).getFieldType(type);
}

function _getCollection(that: Model) {
    return privates.get(that).getCollection(that);
}
