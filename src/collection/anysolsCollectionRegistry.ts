import AnysolsCollection from "./anysolsCollection";

export default class AnysolsCollectionRegistry {

    collections: Map<string, AnysolsCollection>;

    constructor() {
        this.collections = new Map<string, AnysolsCollection>();
    }

    hasCollection = (collectionName: string) => this.collections.has(collectionName);

    getCollection = (collectionName: string): AnysolsCollection | undefined => this.collections.get(collectionName);

    addCollection = (collection: AnysolsCollection) => this.collections.set(collection.getName(), collection);

    deleteCollection = (collectionName: string) => this.collections.delete(collectionName);

};
