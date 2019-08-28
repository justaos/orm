import Query from "../query/query";
import Record from "../record/record";
import FieldTypeRegistry from "../field-types/fieldTypeRegistry";
import * as Ajv from "ajv";
import OperationInterceptorService from "../operation-interceptor/operationInterceptorService";

const privates = new WeakMap();

export default class Collection {

    constructor(schema: any, getCollection: any, fieldTypeRegistry: FieldTypeRegistry, operationInterceptorService: OperationInterceptorService) {
        privates.set(this, {schema, fieldTypeRegistry, operationInterceptorService});
        _validateSchema(this, schema);
        privates.get(this).collection = getCollection(this);
    }

    getName(): string {
        return this.getSchema().name;
    }

    getSchema(): any {
        return privates.get(this).schema;
    }

    createNewRecord() {
        return new Record(null, this).initialize();
    }

    findById(id: string) {
        return this.initializeQuery().findById(id);
    }

    find(conditions: any) {
        return this.initializeQuery().find(conditions);
    }

    async insertOne(record: Record): Promise<Record> {
        record = await _getOperationInterceptorService(this).interceptRecord(this.getName(), 'create', 'before', record);
        const errors = this.validate(record.toObject());
        if (errors)
            throw errors;
        const response = await _getCollection(this).insertOne(record.toObject());
        const savedRecord = new Record(response.ops.find(() => true), this);
        return await _getOperationInterceptorService(this).interceptRecord(this.getName(), 'create', 'after', savedRecord);
    }

    async deleteOne(record: Record): Promise<any> {
        record = await _getOperationInterceptorService(this).interceptRecord(this.getName(), 'delete', 'before', record);
        const response = await _getCollection(this).deleteOne({_id: record.getID()});
    }

    async executeQuery(condition: any): Promise<Record[]> {
        const that = this;
        const docs = await _findDocuments(this, condition);
        const records: Record[] = docs.map((doc: any) => {
            return new Record(doc, that);
        });
        return await _getOperationInterceptorService(this).intercept(this.getName(), 'read', 'after', records);
    }

    validate(recordObject: any) {
        const jsonSchema = _getJsonSchema(this);
        const validate = new Ajv().compile(jsonSchema);
        const schema = this.getSchema();
        const formattedRecord: any = {};
        for (let field of schema.fields) {
            let fieldType = _getFieldTypeRegistry(this).getFieldType(field.type);
            if (fieldType.getDataType(field).format)
                formattedRecord[field.name] = fieldType.getDataType(field).format(recordObject[field.name]);
            else
                formattedRecord[field.name] = recordObject[field.name];
        }
        if (!validate(formattedRecord))
            return validate.errors;
    }

    initializeQuery() {
        return new Query(this);
    }

}

function _validateSchemaError(mesg: string) {
    return new Error("[CollectionService::_validateSchema] " + mesg)
}

function _validateSchema(that: Collection, schema: any) {
    if (!schema)
        throw _validateSchemaError("Definition not provided");
    if (!schema.name)
        throw  _validateSchemaError("Invalid collection-service name");
    if (schema.fields) {
        for (const field of schema.fields) {
            if (!field || !field.type)
                throw _validateSchemaError("field type provided - [collectionName=" + schema.name + "]");
            let fieldType = _getFieldTypeRegistry(that).getFieldType(field.type);
            if (!fieldType)
                throw _validateSchemaError("No such field type  - [collectionName=" + schema.name + ", fieldName=" + field.name + ", fieldType=" + field.type + "]");
            if (!fieldType.validateDefinition(field))
                throw _validateSchemaError("Invalid field definition  [collectionName=" + schema.name + ", fieldName=" + field.name + "]");
        }
        const fieldNames = schema.fields.map((f: any) => f.name);
        if (_areDuplicatesPresent(fieldNames))
            throw _validateSchemaError("Duplicate field name [collectionName=" + schema.name + ", fieldNames=" + fieldNames + "]");
    }
}

function _areDuplicatesPresent(a: []): boolean {
    for (let i = 0; i <= a.length; i++)
        for (let j = i; j <= a.length; j++)
            if (i != j && a[i] == a[j])
                return true;
    return false;
}

function _getCollection(that: Collection) {
    return privates.get(that).collection;
}

function _getFieldTypeRegistry(that: Collection) {
    return privates.get(that).fieldTypeRegistry;
}

function _getOperationInterceptorService(that: Collection): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

function _findDocuments(that: Collection, condition: any): Promise<any> {
    return new Promise((resolve, reject) => {
        _getCollection(that).find(condition).toArray(function (err: any, docs: any) {
            if (err)
                reject(err);
            resolve(docs);
        });
    })
}

function _getJsonSchema(that: Collection) {
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
