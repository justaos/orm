import Cursor from "../Cursor";
import Record from "../record/Record";
import OperationInterceptorService from "../operation-interceptor/OperationInterceptorService";
import Schema from "../Schema";
import {FindOneOptions, ObjectId} from "mongodb";
import * as mongodb from "mongodb";
import {OPERATION_WHEN, OPERATIONS} from "../constants";
import CollectionDefinition from "./CollectionDefinition";

const privates = new WeakMap();

export default class Collection {

    constructor(collectionDefinition: CollectionDefinition, context?: any) {
        const inactiveIntercepts: [] = [];
        privates.set(this, {collectionDefinition, context, inactiveIntercepts});
    }

    getName(): string {
        return this.getSchema().getName();
    }

    getSchema(): Schema {
        return _getCollectionDefinition(this).getSchema();
    }

    createNewRecord() {
        return new Record(null, this).initialize();
    }

    findById(id: ObjectId | string): Promise<Record | null> {
        if (typeof id === 'string')
            id = new ObjectId(id);
        return this.findOne({_id: id}, {});
    }

    deactivateIntercept(interceptName: string) {
        this.getInActivateIntercepts().push(interceptName);
    }

    getInActivateIntercepts(): any {
        return privates.get(this).inactiveIntercepts;
    }

    clearInActivateIntercepts() {
        privates.get(this).inactiveIntercepts = [];
    }

    async findOne(filter: any, options?: FindOneOptions): Promise<Record | null> {
        const schema = this.getSchema();
        if (schema.getExtends()) {
            if (!filter)
                filter = {};
            filter._collection = schema.getName();
        }
        const doc = await _getMongoCollection(this).findOne(filter, options);
        if (doc)
            return new Record(doc, this);
        return null;
    }

    find(filter: any, options?: any): Cursor {
        const schema = this.getSchema();

        if (schema.getExtends()) {
            if (!filter)
                filter = {};
            filter._collection = schema.getName();
            Object.keys(filter).forEach((key) => {
                const fieldDef = schema.getField(key);
                const fieldType = schema.getFieldType(key);
                if (fieldType) {
                    const dataType = fieldType.getDataType(fieldDef);
                    filter[key] = dataType.parse(filter[key]);
                }
            });
        }
        const cursor = _getMongoCollection(this).find(filter, options);
        return new Cursor(cursor, this)
    }

    async insertRecord(record: Record): Promise<Record> {
        record = await _interceptRecord(this, OPERATIONS.CREATE, OPERATION_WHEN.BEFORE, record);
        this.getSchema().validate(record.toObject());
        const response = await _getMongoCollection(this).insertOne(record.toObject());
        const savedDoc = response.ops.find(() => true);
        const savedRecord = new Record(savedDoc, this);
        return await _interceptRecord(this, OPERATIONS.CREATE, OPERATION_WHEN.AFTER, savedRecord);
    }

    async updateRecord(record: Record): Promise<Record> {
        record = await _interceptRecord(this, OPERATIONS.UPDATE, OPERATION_WHEN.BEFORE, record);
        this.getSchema().validate(record.toObject());
        await _getMongoCollection(this).updateOne({_id: record.get('_id')}, {$set: {...record.toObject()}});
        return await _interceptRecord(this, OPERATIONS.UPDATE, OPERATION_WHEN.AFTER, record);
    }

    async deleteOne(record: Record): Promise<any> {
        record = await _interceptRecord(this, OPERATIONS.DELETE, OPERATION_WHEN.BEFORE, record);
        await _getMongoCollection(this).deleteOne({_id: record.get('_id')});
        await _interceptRecord(this, OPERATIONS.DELETE, 'after', record);
    }

    async intercept(operation: string, when: string, payload: any) {
        return await _intercept(this, operation, when, payload);
    }

}

function _getCollectionDefinition(that: Collection): CollectionDefinition {
    return privates.get(that).collectionDefinition;
}

function _getMongoCollection(that: Collection): mongodb.Collection {
    return _getCollectionDefinition(that).getCollection();
}

function _getOperationInterceptorService(that: Collection): OperationInterceptorService {
    return _getCollectionDefinition(that).getOperationInterceptorService();
}

async function _interceptRecord(that: Collection, operation: string, when: string, record: Record): Promise<Record> {
    const updatedPayload = await _intercept(that, operation, when, {records: [record]});
    return updatedPayload.records[0];
}

async function _intercept(that: Collection, operation: string, when: string, payload: any): Promise<any> {
    const operationInterceptorService = _getOperationInterceptorService(that);
    return await operationInterceptorService.intercept(that.getName(), operation, when, payload, privates.get(that).context, privates.get(that).inactiveIntercepts);
}


