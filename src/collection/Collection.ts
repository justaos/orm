import Cursor from "../Cursor";
import Record from "../record/Record";
import OperationInterceptorService from "../operation-interceptor/OperationInterceptorService";
import Schema from "../Schema";
import {FindOneOptions} from "mongodb";
import * as mongodb from "mongodb";
import {OPERATION_WHEN, OPERATIONS} from "../constants";

const privates = new WeakMap();

export default class Collection {

    constructor(collection: any, schema: Schema, operationInterceptorService: OperationInterceptorService) {
        privates.set(this, {collection, schema, operationInterceptorService});
    }

    getName(): string {
        return this.getSchema().getName();
    }

    getSchema(): Schema {
        return privates.get(this).schema;
    }

    createNewRecord() {
        return new Record(null, this).initialize();
    }

    findById(id: string): Promise<Record | null> {
        return this.findOne({_id: id}, {});
    }

    async findOne(filter: any, options?: FindOneOptions): Promise<Record | null> {
        const doc = await _getMongoCollection(this).findOne(filter, options);
        if (doc)
            return new Record(doc, this);
        return null;
    }

    find(filter: any, options?: any): Cursor {
        const cursor = _getMongoCollection(this).find(filter, options);
        return new Cursor(cursor, this, _getOperationInterceptorService(this))
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
        await _getMongoCollection(this).updateOne({_id: record.getID()}, {$set: {...record.toObject()}});
        return await _interceptRecord(this, OPERATIONS.UPDATE, OPERATION_WHEN.AFTER, record);
    }

    async deleteOne(record: Record): Promise<any> {
        record = await _interceptRecord(this, OPERATIONS.DELETE, OPERATION_WHEN.BEFORE, record);
        await _getMongoCollection(this).deleteOne({_id: record.getID()});
        await _interceptRecord(this, OPERATIONS.DELETE, 'after', record);
    }

}

function _getMongoCollection(that: Collection): mongodb.Collection {
    return privates.get(that).collection;
}

function _getOperationInterceptorService(that: Collection): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

async function _interceptRecord(that: Collection, operation: string, when: string, record: Record): Promise<Record> {
    const updatedPayload = await _intercept(that, operation, when, {records: [record]});
    return updatedPayload.records[0];
}

async function _intercept(that: Collection, operation: string, when: string, payload: any): Promise<any> {
    const operationInterceptorService = _getOperationInterceptorService(that);
    return await operationInterceptorService.intercept(that.getName(), operation, when, payload);
}

