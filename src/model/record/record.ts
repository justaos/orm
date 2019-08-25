import Model from "../model";

const privates = new WeakMap();

export default class Record {

    isNew: any;

    record: any;

    constructor(record: any, model: Model, collection: any) {
        this.record = record;
        privates.set(this, {model, collection});
    }

    initialize() {
        this.record = {};
        this.isNew = true;
        return this;
    }

    getID() {
        return this.record._id;
    }

    set(key: string, value: any) {
        this.record[key] = value;
    }

    get(key: string) {
        return this.record[key];
    }

    async insert() {
        let response = await _getCollection(this).insertOne(this.toObject());
        this.record = response.ops.find(() => true);
        this.isNew = false;
        return this;
    }

    toObject() {
        const record = this.record;
        let obj: any = {};
        _getSchema(this).fields.map(function (field: any) {
            obj[field.name] = record[field.name];
        });
        return obj;
    }
}

function _getCollection(that: Record) {
    return privates.get(that).collection;
}

function _getSchema(that: Record) {
    return privates.get(that).model.getSchema();
}
