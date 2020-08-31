import OperationInterceptorService from "../operation-interceptor/OperationInterceptorService";
import Schema from "./Schema";
import * as mongodb from "mongodb";

export default class CollectionDefinition {

    #collection: mongodb.Collection;

    #schema: Schema;

    #operationInterceptorService: OperationInterceptorService;

    constructor(collection: any, schema: Schema, operationInterceptorService: OperationInterceptorService) {
        this.#collection = collection;
        this.#schema = schema;
        this.#operationInterceptorService = operationInterceptorService;
    }

    getName(): string {
        return this.getSchema().getName();
    }

    getCollection(): mongodb.Collection {
        return this.#collection;
    }

    getSchema(): Schema {
        return this.#schema;
    }

    getOperationInterceptorService(): OperationInterceptorService {
        return this.#operationInterceptorService;
    }
}

