import {ObjectId} from "bson";

const privates = new WeakMap();

export default class Query {

    query: any;

    constructor(collection: any) {
        this.query = {};
        privates.set(this, {collection});
    }

    findById(id: string): Query {
        this.query = {_id: id};
        return this;
    }

    find(condition: string): Query {
        this.query = condition;
        return this;
    }

    execute(): Promise<any> {
        return new Promise((resolve, reject) => {
            _getCollection(this).find(this.query).toArray(function (err: any, docs: any) {
                if (err)
                    reject(err);
                resolve(docs);
            });
        });
    }
}

function _getCollection(that: Query) {
    return privates.get(that).collection;
}
