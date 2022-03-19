import Collection from './collection/Collection';
import * as mongodb from 'mongodb';
import { Sort, SortDirection } from 'mongodb';
import Record from './record/Record';
import { OperationType, OperationWhen } from './constants';

export default class FindCursor {
  readonly #cursor: mongodb.FindCursor;

  readonly #collection: Collection;

  constructor(cursor: mongodb.FindCursor, collection: Collection) {
    this.#cursor = cursor;
    this.#collection = collection;
  }

  getCollection(): Collection {
    return this.#collection;
  }

  sort(keyOrList: Sort | string, direction?: SortDirection): FindCursor {
    this.#cursor.sort(keyOrList, direction);
    return this;
  }

  skip(num: number): FindCursor {
    this.#cursor.skip(num);
    return this;
  }

  limit(num: number): FindCursor {
    this.#cursor.limit(num);
    return this;
  }

  async count(): Promise<number> {
    return await this.#cursor.count();
  }

  async toArray(): Promise<Record[]> {
    const odmCollection = this.#collection;
    const docs = await this.#cursor.toArray();
    await odmCollection.intercept(OperationType.READ, OperationWhen.BEFORE, []);
    const records = docs.map((doc) => new Record(doc, odmCollection));
    return await odmCollection.intercept(
      OperationType.READ,
      OperationWhen.AFTER,
      records
    );
  }
}
