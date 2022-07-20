import Schema from './Schema.ts';

export default class SchemaRegistry {
  schemas: Map<string, Schema> = new Map<string, Schema>();

  hasSchema = (name: string): boolean => this.schemas.has(name);

  getSchema = (name: string): Schema | undefined => this.schemas.get(name);

  addSchema = (collection: Schema): void => {
    this.schemas.set(collection.getName(), collection);
  };

  deleteSchema = (collectionName: string): boolean =>
    this.schemas.delete(collectionName);
}
