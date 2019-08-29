import AnysolsCursor from "../cursor/anysolsCursor";
import AnysolsRecord from "../record/anysolsRecord";
import OperationInterceptorService from "../operation-interceptor/operationInterceptorService";
import AnysolsSchema from "../schema/anysolsSchema";
import {Collection, Cursor, FindOneOptions} from "mongodb";

const privates = new WeakMap();

export default class AnysolsCollection {

    constructor(collection: any, schema: AnysolsSchema, operationInterceptorService: OperationInterceptorService) {
        privates.set(this, {collection, schema, operationInterceptorService});
    }

    getName(): string {
        return this.getSchema().getName();
    }

    getSchema(): AnysolsSchema {
        return privates.get(this).schema;
    }

    createNewRecord() {
        return new AnysolsRecord(null, this).initialize();
    }

    findById(id: string): Promise<AnysolsRecord | null> {
        return this.findOne({_id: id}, {});
    }

    async findOne(filter: any, options?: FindOneOptions): Promise<AnysolsRecord | null> {
        const doc = await _getCollection(this).findOne(filter, options);
        if (doc)
            return new AnysolsRecord(doc, this);
        return null;
    }

    find(filter: any): AnysolsCursor {
        const cursor = _getCollection(this).find(filter);
        return _createAnysolsCursor(this, cursor);
    }

    async insertOne(record: AnysolsRecord): Promise<AnysolsRecord> {
        record = await _interceptRecord(this, 'create', 'before', record);
        const errors = this.getSchema().validate(record.toObject());
        if (errors)
            throw errors;
        const response = await _getCollection(this).insertOne(record.toObject());
        const savedDoc = response.ops.find(() => true);
        const savedRecord = new AnysolsRecord(savedDoc, this);
        return await _interceptRecord(this, 'create', 'after', savedRecord);
    }

    async deleteOne(record: AnysolsRecord): Promise<any> {
        record = await _interceptRecord(this, 'delete', 'before', record);
        await _getCollection(this).deleteOne({_id: record.getID()});
        await _interceptRecord(this, 'delete', 'after', record);
    }

}

function _createAnysolsCursor(that: AnysolsCollection, cursor: Cursor): AnysolsCursor {
    return new AnysolsCursor(cursor, that, _getOperationInterceptorService(that));
}

function _getCollection(that: AnysolsCollection): Collection {
    return privates.get(that).collection;
}

function _getOperationInterceptorService(that: AnysolsCollection): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

async function _interceptRecord(that: AnysolsCollection, operation: string, when: string, record: AnysolsRecord): Promise<AnysolsRecord> {
    const updatedPayload = await _intercept(that, operation, when, {records: [record]});
    return updatedPayload.records[0];
}

async function _intercept(that: AnysolsCollection, operation: string, when: string, payload: any): Promise<any> {
    const operationInterceptorService = _getOperationInterceptorService(that);
    return await operationInterceptorService.intercept(that.getName(), operation, when, payload);
}


