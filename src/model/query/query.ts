import Model from "../model";

const privates = new WeakMap();

export default class Query {

    query: any;
    singleRecordOperation: boolean;

    constructor(model: Model) {
        this.query = {};
        this.singleRecordOperation = false;
        privates.set(this, {model});
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
        const records = await _getModel(this).executeQuery(this.query);
        if (this.singleRecordOperation) {
            if (records.length)
                return records[0];
            else
                return;
        }
        return records;
    }
}

function _getModel(that: Query) {
    return privates.get(that).model;
}
