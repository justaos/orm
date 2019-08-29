import AnysolsCollection from "../collection/anysolsCollection";
import AnysolsSchema from "../schema/anysolsSchema";

const privates = new WeakMap();

export default class AnysolsRecord {

    isNew: any;

    record: any;

    constructor(record: any, anysolsCollection: AnysolsCollection) {
        this.record = record;
        privates.set(this, {anysolsCollection});
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
        let record = await _getAnysolsCollection(this).insertRecord(this);
        this.record = record.toObject();
        this.isNew = false;
        return this;
    }

    async update() {
        let record = await _getAnysolsCollection(this).updateRecord(this);
        this.record = record.toObject();
        this.isNew = false;
        return this;
    }

    async delete() {
        if (this.isNew)
            throw Error('[Record::remove] Cannot remove unsaved record');
        await _getAnysolsCollection(this).deleteOne(this);
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

function _getSchema(that: AnysolsRecord): AnysolsSchema {
    return _getAnysolsCollection(that).getSchema();
}

function _getAnysolsCollection(that: AnysolsRecord): AnysolsCollection {
    return privates.get(that).anysolsCollection;
}
