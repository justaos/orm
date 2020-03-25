import CollectionDefinition from "./CollectionDefinition";

export default class CollectionDefinitionRegistry {

    collectionDefinitions: Map<string, CollectionDefinition>;

    constructor() {
        this.collectionDefinitions = new Map<string, CollectionDefinition>();
    }

    hasCollectionDefinition = (collectionName: string): boolean => this.collectionDefinitions.has(collectionName);

    getCollectionDefinition = (collectionName: string): CollectionDefinition | undefined => this.collectionDefinitions.get(collectionName);

    addCollectionDefinition = (collection: CollectionDefinition) => this.collectionDefinitions.set(collection.getName(), collection);

    deleteCollectionDefinition = (collectionName: string) => this.collectionDefinitions.delete(collectionName);

};
