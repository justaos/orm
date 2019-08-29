import Collection from "../collection/collection";

const privates = new WeakMap();

export default class Query {

    query: any;
    singleRecordOperation: boolean;

    constructor(collection: Collection) {
        this.query = {};
        this.singleRecordOperation = false;
        privates.set(this, {collection});
    }

    findById(id: string): Query {
        this.singleRecordOperation = true;
        this.query = {_id: id};
        return this;
    }

    find(condition: string): Query {
        this.singleRecordOperation = false;
        this.query = condition;
        return this;
    }

    async execute(): Promise<any> {
        const records = await _getCollection(this).executeQuery(this.query);
        if (this.singleRecordOperation) {
            if (records.length)
                return records[0];
            else
                return;
        }
        return records;
    }
}

function _getCollection(that: Query): Collection {
    return privates.get(that).collection;
}
