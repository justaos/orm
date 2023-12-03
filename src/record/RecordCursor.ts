import Table from "../table/Table.ts";
import Record from "./Record.ts";

export default class RecordCursor {
  #rawCursor: any;

  #cursor: AsyncIterator<any>;

  #done = false;

  readonly #table: Table;

  constructor(cursor: any, table: Table) {
    this.#rawCursor = cursor;
    this.#cursor = cursor[Symbol.asyncIterator]();
    this.#table = table;
  }

  async next(): Promise<Record> {
    if (this.#done) {
      throw new Error("Cursor is done");
    }
    const item = await this.#cursor.next();
    if (item.done) {
      this.#done = true;
    }
    return new Record(item.value[0], this.#table);
  }
}
