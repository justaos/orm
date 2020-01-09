import Collection from "./Collection";

export default class CollectionRegistry {

    collections: Map<string, Collection>;

    constructor() {
        this.collections = new Map<string, Collection>();
    }

    hasCollection = (collectionName: string): boolean => this.collections.has(collectionName);

    getCollection = (collectionName: string): Collection | undefined => this.collections.get(collectionName);

    addCollection = (collection: Collection) => this.collections.set(collection.getName(), collection);

    deleteCollection = (collectionName: string) => this.collections.delete(collectionName);

};
