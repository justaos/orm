import { mongodb } from "../../deps.ts";

import Table from "./Table.ts";

export default class AggregationCursor {
  readonly #cursor: mongodb.AggregationCursor;

  readonly #collection: Table;

  constructor(cursor: mongodb.AggregationCursor, collection: Table) {
    this.#cursor = cursor;
    this.#collection = collection;
  }

  getCollection(): Table {
    return this.#collection;
  }

  async toArray(): Promise<any[]> {
    return await this.#cursor.toArray();
  }
}
