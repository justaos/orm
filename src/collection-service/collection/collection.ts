import Query from "../query/query";
import Record from "../record/record";
import OperationInterceptorService from "../operation-interceptor/operationInterceptorService";
import Schema from "../schema/schema";

const privates = new WeakMap();

export default class Collection {

    constructor(schema: Schema, dbCollection: any, operationInterceptorService: OperationInterceptorService) {
        privates.set(this, {schema, dbCollection, operationInterceptorService});
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

    findById(id: string): Query {
        return _initializeQuery(this).findById(id);
    }

    find(conditions: any): Query {
        return _initializeQuery(this).find(conditions);
    }

    async insertOne(record: Record): Promise<Record> {
        record = await _getOperationInterceptorService(this).interceptRecord(this.getName(), 'create', 'before', record);
        const errors = this.getSchema().validate(record.toObject());
        if (errors)
            throw errors;
        const response = await _getDBCollection(this).insertOne(record.toObject());
        const savedRecord = new Record(response.ops.find(() => true), this);
        return await _getOperationInterceptorService(this).interceptRecord(this.getName(), 'create', 'after', savedRecord);
    }

    async deleteOne(record: Record): Promise<any> {
        record = await _getOperationInterceptorService(this).interceptRecord(this.getName(), 'delete', 'before', record);
        const response = await _getDBCollection(this).deleteOne({_id: record.getID()});
    }

    async executeQuery(condition: any): Promise<Record[]> {
        const that = this;
        const docs = await _getDBCollection(that).find(condition).toArray();
        const records: Record[] = docs.map((doc: any) => {
            return new Record(doc, that);
        });
        return await _getOperationInterceptorService(this).intercept(this.getName(), 'read', 'after', records);
    }

}

function _initializeQuery(that: Collection) {
    return new Query(that);
}

function _getDBCollection(that: Collection) {
    return privates.get(that).dbCollection;
}

function _getOperationInterceptorService(that: Collection): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}


