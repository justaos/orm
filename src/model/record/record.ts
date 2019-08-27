import Model from "../model";

const privates = new WeakMap();

export default class Record {

    isNew: any;

    record: any;

    constructor(record: any, model: Model) {
        this.record = record;
        privates.set(this, {model});
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
        let record = await _getModel(this).insertOne(this);
        this.record = record.toObject();
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

function _getSchema(that: Record) {
    return _getModel(that).getSchema();
}

function _getModel(that: Record) {
    return privates.get(that).model;
}
