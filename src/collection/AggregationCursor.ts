import Collection from './Collection';
import * as mongodb from 'mongodb';

export default class AggregationCursor {
  readonly #cursor: mongodb.AggregationCursor;

  readonly #collection: Collection;

  constructor(cursor: mongodb.AggregationCursor, collection: Collection) {
    this.#cursor = cursor;
    this.#collection = collection;
  }

  getCollection(): Collection {
    return this.#collection;
  }

  async toArray(): Promise<any[]> {
    return await this.#cursor.toArray();
  }
}
