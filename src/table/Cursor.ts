import { PgCursor } from "../../deps.ts";

export default class Cursor {
  #cursor: PgCursor;

  constructor(cursor: PgCursor) {
    this.#cursor = cursor;
  }
}
