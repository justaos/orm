import { mongodb, AggregateCursor } from '../../deps.ts';



import Collection from './Collection.ts';

export default class AggregationCursor {
  readonly #cursor: AggregateCursor<any>;

  readonly #collection: Collection;

  constructor(cursor: AggregateCursor<any>, collection: Collection) {
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
