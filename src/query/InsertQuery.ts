import type { JSONObject } from "../../deps.ts";
import QueryUtils from "./QueryUtils.ts";
import { getFullFormTableName } from "../utils.ts";
import ORMError from "../errors/ORMError.ts";

export default class InsertQuery {
  #tableName?: string;
  #columns?: string[];
  #rows?: any[];
  #returning?: string[];

  constructor() {}

  into(tableName: string): InsertQuery {
    this.#tableName = getFullFormTableName(tableName);
    return this;
  }

  columns(...args: string[]): InsertQuery {
    if (args.length === 1 && Array.isArray(args[0])) {
      this.#columns = args[0];
    } else if (args.length === 1 && typeof args[0] === "object") {
      this.#columns = Object.keys(args[0]);
    } else {
      this.#columns = args.map((arg) => {
        if (typeof arg === "object") {
          throw ORMError.queryError("Invalid argument");
        }
        return arg;
      });
    }
    return this;
  }

  returning(...args: string[]): InsertQuery {
    if (args.length === 0) {
      this.#returning = ["*"];
    } else if (args.length === 1 && Array.isArray(args[0])) {
      this.#returning = args[0];
    } else if (args.length === 1 && typeof args[0] === "object") {
      this.#returning = Object.keys(args[0]);
    } else {
      this.#returning = args.map((arg) => {
        if (typeof arg === "object") {
          throw new ORMError("QUERY", "Invalid argument");
        }
        return arg;
      });
    }
    return this;
  }

  values(rows: any[]): InsertQuery {
    this.#rows = rows;
    return this;
  }

  buildQuery(): string {
    if (typeof this.#columns === "undefined") {
      throw new ORMError("QUERY", "Columns not defined");
    }

    let query = `INSERT INTO ${this.#tableName}`;
    if (this.#columns) {
      query += ` (${this.#columns.map((col) => `"${col}"`).join(", ")})\n`;
    }
    if (this.#rows) {
      this.#rows.forEach((row) => {
        const newRow = this.#getRowWithSelectedColumns(row);

        query += ` VALUES (${newRow.join(", ")})`;
      });
    }
    if (this.#returning) {
      query += ` RETURNING ${this.#returning.join(", ")}`;
    }
    return query;
  }

  #getRowWithSelectedColumns(row: JSONObject): string[] {
    const newRow: string[] = [];
    this.#columns?.forEach((column: string) => {
      newRow.push(QueryUtils.escapeValue(row[column]));
    });
    return newRow;
  }
}
