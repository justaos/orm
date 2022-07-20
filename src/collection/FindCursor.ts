import { mongodb, FindCursor as MongoFindCursor } from '../../deps.ts';

import Collection from './Collection.ts';
import Record from '../record/Record.ts';
import { OperationType, OperationWhen } from '../constants.ts';

export default class FindCursor {
  readonly #cursor: MongoFindCursor<any>;

  readonly #collection: Collection;

  constructor(cursor: MongoFindCursor<any>, collection: Collection) {
    this.#cursor = cursor;
    this.#collection = collection;
  }

  getCollection(): Collection {
    return this.#collection;
  }

  /*
  * Sort the results by the given key.
  * 'name' or { age : -1, posts: 1 }
   */
  sort(
    keyOrList: string | { [key: string]: number },
    direction: number = 1
  ): FindCursor {
    if (typeof keyOrList === 'string') {
      this.#cursor.sort({ [keyOrList]: direction });
    } else {
      this.#cursor.sort(keyOrList);
    }

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
