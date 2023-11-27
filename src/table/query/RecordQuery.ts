import Table from "../Table.ts";

export default class RecordQuery {
  #table: Table;

  constructor(table: Table) {
    this.#table = table;
  }

  getTable(): Table {
    return this.#table;
  }
  execute(): void {
    throw new Error("Method not implemented.");
  }
}