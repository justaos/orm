import Collection from "./collection/Collection";
import * as mongodb from "mongodb";
import Record from "./record/Record";
import {OPERATION_WHEN, OPERATIONS} from "./constants";

export default class Cursor {

    #cursor: mongodb.Cursor;

    #odmCollection: Collection;

    constructor(cursor: mongodb.Cursor, odmCollection: Collection) {
        this.#cursor = cursor;
        this.#odmCollection = odmCollection;
    }

    sort(keyOrList: string | object[] | object, direction?: number) {
        this.#cursor.sort(keyOrList, direction);
        return this;
    }

    limit(num: number) {
        this.#cursor.limit(num);
        return this;
    }

    async toArray(): Promise<Record[]> {
        const odmCollection = this.#odmCollection
        const docs = await this.#cursor.toArray();
        await odmCollection.intercept(OPERATIONS.READ, OPERATION_WHEN.BEFORE, {});
        let records = docs.map(doc => new Record(doc, odmCollection));
        let updatedPayload = await odmCollection.intercept(OPERATIONS.READ, OPERATION_WHEN.AFTER, {records});
        return updatedPayload.records;
    }

}