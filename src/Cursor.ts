import Collection from './collection/Collection';
import * as mongodb from 'mongodb';
import Record from './record/Record';
import { OPERATION_WHEN, OPERATIONS } from './constants';

export default class Cursor {
  #cursor: mongodb.Cursor;

  #odmCollection: Collection;

  constructor(cursor: mongodb.Cursor, odmCollection: Collection) {
    this.#cursor = cursor;
    this.#odmCollection = odmCollection;
  }

  sort(keyOrList: string | any[] | any, direction?: number) {
    this.#cursor.sort(keyOrList, direction);
    return this;
  }

  skip(num: number) {
    this.#cursor.skip(num);
    return this;
  }

  limit(num: number) {
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
      { records },
    );
    return updatedPayload.records;
  }
}
