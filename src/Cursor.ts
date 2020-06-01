import Collection from "./collection/Collection";
import * as mongodb from "mongodb";
import Record from "./record/Record";
import {OPERATION_WHEN, OPERATIONS} from "./constants";

const privates = new WeakMap();

export default class Cursor {

    constructor(cursor: mongodb.Cursor, odmCollection: Collection) {
        privates.set(this, {cursor, odmCollection});
    }

    sort(keyOrList: string | object[] | object, direction?: number) {
        _getCursor(this).sort(keyOrList, direction);
        return this;
    }

    limit(num: number) {
        _getCursor(this).limit(num);
        return this;
    }

    async toArray(): Promise<Record[]> {
        const col = _getCollection(this);
        const docs = await _getCursor(this).toArray();
        await col.intercept(OPERATIONS.READ, OPERATION_WHEN.BEFORE, {});
        let records = docs.map(doc => new Record(doc, _getCollection(this)));
        let updatedPayload = await col.intercept(OPERATIONS.READ, OPERATION_WHEN.AFTER, {records});
        return updatedPayload.records;
    }

}

function _getCursor(that: Cursor): mongodb.Cursor {
    return privates.get(that).cursor;
}

function _getCollection(that: Cursor): Collection {
    return privates.get(that).odmCollection;
}