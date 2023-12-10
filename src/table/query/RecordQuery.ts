import Table from "../Table.ts";

export default class RecordQuery {
  readonly #table: Table;

  constructor(table: Table) {
    this.#table = table;
  }

  getTable(): Table {
    return this.#table;
  }
}
