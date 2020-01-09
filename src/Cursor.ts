import Collection from "./collection/Collection";
import * as mongodb from "mongodb";
import Record from "./record/Record";
import OperationInterceptorService from "./operation-interceptor/OperationInterceptorService";
import {OPERATION_WHEN, OPERATIONS} from "./constants";

const privates = new WeakMap();

export default class Cursor {

    constructor(cursor: mongodb.Cursor, odmCollection: Collection, operationInterceptorService: OperationInterceptorService) {
        privates.set(this, {cursor, odmCollection, operationInterceptorService});
    }

    sort(keyOrList: string | object[] | object, direction?: number) {
        _getCursor(this).sort(keyOrList, direction);
        return this;
    }

    async toArray(): Promise<Record[]> {
        const docs = await _getCursor(this).toArray();
        await _intercept(this, OPERATIONS.READ, OPERATION_WHEN.BEFORE, {});
        let records = docs.map(doc => new Record(doc, _getCollection(this)));
        let updatedPayload = await _intercept(this, OPERATIONS.READ, OPERATION_WHEN.AFTER, {records});
        return updatedPayload.records;
    }

}

function _getCursor(that: Cursor): mongodb.Cursor {
    return privates.get(that).cursor;
}

function _getCollection(that: Cursor): Collection {
    return privates.get(that).odmCollection;
}

function _getOperationInterceptorService(that: Cursor): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

async function _intercept(that: Cursor, operation: string, when: string, payload: any): Promise<any> {
    const col = _getCollection(that);
    const operationInterceptorService = _getOperationInterceptorService(that);
    return await operationInterceptorService.intercept(col.getName(), operation, when, payload);
}
