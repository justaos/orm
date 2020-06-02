import Collection from "../collection/Collection";
import Schema from "../Schema";
import {ObjectId} from "mongodb"

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
        this.record["_collection"] = _getCollection(this).getName();
        this.isNew = true;
        return this;
    }

    getID() {
        return this.record._id;
    }

    set(key: string, value: any) {
        const schema: Schema = _getSchema(this);
        const field = schema.getField(key);
        if (field && (field.name === '_id' || field.dataType === 'objectId') && typeof value === 'string')
            this.record[key] = new ObjectId(value);
        else
            this.record[key] = value;
    }

    get(key: string) {
        return this.record[key];
    }

    async getDisplayValue(key: string) {
        const schema = _getSchema(this);
        const fieldDef = schema.getField(key);
        const fieldType = schema.getFieldType(key);
        if (fieldType)
            return fieldType.getDisplayValue(schema, fieldDef, this.record[key]);
    }

    async insert() {
        let record = await _getCollection(this).insertRecord(this);
        this.record = record.toObject();
        this.isNew = false;
        return this;
    }

    async update() {
        let record = await _getCollection(this).updateRecord(this);
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
        const obj: any = {};
        _getSchema(this).getFields().map(function (field: any) {
            obj[field.name] = typeof record[field.name] === "undefined" ? null : record[field.name];
        });
        return obj;
    }

    async toObjectWithDisplayValues() {
        const that = this;
        const record = this.record;
        const obj: any = {};
        for(let field of _getSchema(this).getFields()) {
            if (typeof record[field.name] === "undefined")
                obj[field.name] = null;
            else
                obj[field.name] = {
                    value: record[field.name],
                    displayValue: await that.getDisplayValue(field.name)
                };
        }
        return obj;
    }
}

function _getSchema(that: Record): Schema {
    return _getCollection(that).getSchema();
}

function _getCollection(that: Record): Collection {
    return privates.get(that).collection;
}
