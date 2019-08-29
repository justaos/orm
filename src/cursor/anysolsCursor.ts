import AnysolsCollection from "../collection/anysolsCollection";
import {Cursor} from "mongodb";
import AnysolsRecord from "../record/anysolsRecord";
import OperationInterceptorService from "../operation-interceptor/operationInterceptorService";

const privates = new WeakMap();

export default class AnysolsCursor {

    constructor(cursor: Cursor, anysolsCollection: AnysolsCollection, operationInterceptorService: OperationInterceptorService) {
        privates.set(this, {cursor, anysolsCollection, operationInterceptorService});
    }

    async toArray(): Promise<AnysolsRecord[]> {
        const docs = await _getCursor(this).toArray();
        await _intercept(this, 'read', 'before', {});
        let records = docs.map(doc => new AnysolsRecord(doc, _getAnysolsCollection(this)));
        let updatedPayload = await _intercept(this, 'read', 'after', {records});
        return updatedPayload.records;
    }

}

function _getCursor(that: AnysolsCursor): Cursor {
    return privates.get(that).cursor;
}

function _getAnysolsCollection(that: AnysolsCursor): AnysolsCollection {
    return privates.get(that).anysolsCollection;
}

function _getOperationInterceptorService(that: AnysolsCursor): OperationInterceptorService {
    return privates.get(that).operationInterceptorService;
}

async function _intercept(that: AnysolsCursor, operation: string, when: string, payload: any): Promise<any> {
    const anysolsCollection = _getAnysolsCollection(that);
    const operationInterceptorService = _getOperationInterceptorService(that);
    return await operationInterceptorService.intercept(anysolsCollection.getName(), operation, when, payload);
}
