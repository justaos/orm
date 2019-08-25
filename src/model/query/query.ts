import Record from "../record/record";
import Model from "../model";

const privates = new WeakMap();

export default class Query {

    query: any;

    constructor(model: Model, collection: any) {
        this.query = {};
        privates.set(this, {model, collection});
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
        const that = this;
        return new Promise((resolve, reject) => {
            _getCollection(this).find(this.query).toArray(function (err: any, docs: any) {
                if (err)
                    reject(err);
                resolve(docs.map((doc: any) => new Record(doc, _getSchema(that), _getCollection(that))));
            });
        });
    }
}

function _getCollection(that: Query) {
    return privates.get(that).collection;
}

function _getSchema(that: Query) {
    return privates.get(that).model.getSchema();
}
