import Collection from "../collection/collection";
import Schema from "../schema/schema";

const privates = new WeakMap();

export default class Record {

    isNew: any;

    record: any;

    constructor(record: any, collection: Collection) {
        this.record = record;
        privates.set(this, {collection});
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
        let record = await _getCollection(this).insertOne(this);
        this.record = record.toObject();
        this.isNew = false;
        return this;
    }

    async delete() {
        if (this.isNew)
            throw Error('[Record::remove] Cannot remove unsaved record');
        await _getCollection(this).deleteOne(this);
        return this;
    }

    toObject() {
        const record = this.record;
        let obj: any = {};
        // todo : Handle id
        obj['_id'] = record['_id'];
        _getSchema(this).getFields().map(function (fieldDefinition: any) {
            obj[fieldDefinition.name] = record[fieldDefinition.name];
        });
        return obj;
    }
}

function _getSchema(that: Record): Schema {
    return _getCollection(that).getSchema();
}

function _getCollection(that: Record) {
    return privates.get(that).collection;
}
