import Collection from './collection/Collection';
import * as mongodb from 'mongodb';
import Record from './record/Record';
import { OPERATION_WHEN, OPERATIONS } from './constants';
import { Sort, SortDirection } from 'mongodb';

export default class FindCursor {
  readonly #cursor: mongodb.FindCursor;

  readonly #odmCollection: Collection;

  constructor(cursor: mongodb.FindCursor, odmCollection: Collection) {
    this.#cursor = cursor;
    this.#odmCollection = odmCollection;
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
    const odmCollection = this.#odmCollection;
    const docs = await this.#cursor.toArray();
    await odmCollection.intercept(OPERATIONS.READ, OPERATION_WHEN.BEFORE, {});
    const records = docs.map((doc) => new Record(doc, odmCollection));
    const updatedPayload = await odmCollection.intercept(
      OPERATIONS.READ,
      OPERATION_WHEN.AFTER,
      { records }
    );
    return updatedPayload.records;
  }
}
