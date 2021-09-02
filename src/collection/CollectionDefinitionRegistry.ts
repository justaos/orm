import CollectionDefinition from './CollectionDefinition';

export default class CollectionDefinitionRegistry {
  collectionDefinitions: Map<string, CollectionDefinition> = new Map<
    string,
    CollectionDefinition
  >();

  relations: Map<string, string | undefined> = new Map<
    string,
    string | undefined
  >();

  hasCollectionDefinition = (collectionName: string): boolean =>
    this.collectionDefinitions.has(collectionName);

  getCollectionDefinition = (
    collectionName: string
  ): CollectionDefinition | undefined =>
    this.collectionDefinitions.get(collectionName);

  addCollectionDefinition = (collection: CollectionDefinition): void => {
    this.collectionDefinitions.set(collection.getName(), collection);
    this.relations.set(
      collection.getName(),
      collection.getSchema().getExtends()
    );
  };

  deleteCollectionDefinition = (collectionName: string): boolean =>
    this.collectionDefinitions.delete(collectionName);
}
