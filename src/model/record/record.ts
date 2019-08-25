const privates = new WeakMap();

export default class Record {

    isNew: any;

    record: any;

    constructor(record: any, getCollection: any) {
        this.record = record;
        privates.set(this, {getCollection});
    }

    initilize() {
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
        let response = await _getCollection(this).insertOne(this.record);
        this.record = response.ops.find(() => true);
        this.isNew = false;
        return this;
    }
}

function _getCollection(that: Record) {
    return privates.get(that).getCollection();
}
