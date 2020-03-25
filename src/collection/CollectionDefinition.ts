import OperationInterceptorService from "../operation-interceptor/OperationInterceptorService";
import Schema from "../Schema";
import * as mongodb from "mongodb";

const privates = new WeakMap();

export default class CollectionDefinition {

    constructor(collection: any, schema: Schema,  operationInterceptorService: OperationInterceptorService) {
        privates.set(this, {collection, schema, operationInterceptorService});
    }

    getName(): string {
        return this.getSchema().getName();
    }

    getCollection(): mongodb.Collection {
        return privates.get(this).collection;
    }

    getSchema(): Schema {
        return privates.get(this).schema;
    }

    getOperationInterceptorService(): OperationInterceptorService {
        return privates.get(this).operationInterceptorService;
    }
}

