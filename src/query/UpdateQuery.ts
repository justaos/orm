import QueryUtils from "./QueryUtils.ts";
import WhereClause from "./WhereClause.ts";
import { getFullFormTableName } from "../utils.ts";
import ORMError from "../errors/ORMError.ts";

export default class UpdateQuery extends WhereClause {
  #tableName?: string;
  #columns?: string[];
  #row?: [];
  #returning: string[] = ["*"];

  constructor() {
    super();
  }

  into(tableName: string): UpdateQuery {
    this.#tableName = getFullFormTableName(tableName);
    return this;
  }

  columns(...args: string[]): UpdateQuery {
    if (args.length === 1 && Array.isArray(args[0])) {
      this.#columns = args[0];
    } else if (args.length === 1 && typeof args[0] === "object") {
      this.#columns = Object.keys(args[0]);
    } else {
      this.#columns = args.map((arg) => {
        if (typeof arg === "object") {
          throw new ORMError("QUERY", "Invalid argument");
        }
        return arg;
      });
    }
    return this;
  }

  returning(...args: string[]): UpdateQuery {
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

  value(row: any): UpdateQuery {
    this.#row = row;
    return this;
  }

  buildQuery(): string {
    if (typeof this.#columns === "undefined") {
      throw new ORMError("QUERY", "Columns not defined");
    }

    let query = `UPDATE ${this.#tableName}`;
    if (typeof this.#row !== "undefined") {
      const row: any = this.#row;
      query += ` SET ${
        this.#columns.map((column) => {
          return `"${column}" = ${QueryUtils.escapeValue(row[column])}`;
        })
      }`;
    }
    query = query + this.prepareWhereClause();
    query += ` RETURNING ${this.#returning}`;
    return query;
  }
}
