import { mongodb } from "../../deps.ts";

import Table from "./Table.ts";
import Record from "../record/Record.ts";
import { DatabaseOperationType, DatabaseOperationWhen } from "../constants.ts";

export default class FindCursor {
  readonly #cursor: mongodb.FindCursor;

  readonly #collection: Table;

  constructor(cursor: mongodb.FindCursor, collection: Table) {
    this.#cursor = cursor;
    this.#collection = collection;
  }

  getCollection(): Table {
    return this.#collection;
  }

  sort(
    keyOrList: mongodb.Sort | string,
    direction?: mongodb.SortDirection
  ): FindCursor {
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

  async toArray(): Promise<Record[]> {
    const odmCollection = this.#collection;
    const docs = await this.#cursor.toArray();
    await odmCollection.intercept(
      DatabaseOperationType.READ,
      DatabaseOperationWhen.BEFORE,
      []
    );
    const records = docs.map((doc: any) => new Record(doc, odmCollection));
    return await odmCollection.intercept(
      DatabaseOperationType.READ,
      DatabaseOperationWhen.AFTER,
      records
    );
  }
}
