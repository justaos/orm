import { SqlString } from "../../deps.ts";
import { DatabaseErrorCode, ORMError } from "../errors/ORMError.ts";
import QueryUtils from "./QueryUtils.ts";

export default class UpdateQuery {
  #tableName?: string;
  #columns?: string[];
  #row?: [];
  #where: any[] = [];
  #returning?: string[];

  constructor() {}

  into(nameWithSchema: string): UpdateQuery {
    this.#tableName = nameWithSchema;
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
          throw new Error("Invalid argument");
        }
        return arg;
      });
    }
    return this;
  }

  where(
    column: string | number | boolean,
    operator: any,
    value?: any
  ): UpdateQuery {
    // Support "where true || where false"
    if (column === false || column === true) {
      return this.where(1, "=", column ? 1 : 0);
    }
    if (typeof value === "undefined") {
      return this.where(column, "=", operator);
    }

    this.#where.push({
      column,
      operator,
      value
    });

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
          throw new Error("Invalid argument");
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
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Columns not defined"
      );
    }

    let query = `UPDATE ${this.#tableName}`;
    if (typeof this.#row !== "undefined") {
      const row: any = this.#row;
      query += ` SET ${this.#columns.map((column) => {
        return `"${column}" = ${QueryUtils.escapeValue(row[column])}`;
      })}`;
    }
    if (this.#where.length > 0) {
      query += ` WHERE ${this.#where
        .map((condition) => {
          return `${condition.column} ${condition.operator} ${QueryUtils.escapeValue(
            condition.value
          )}`;
        })
        .join(" AND ")}`;
    }
    if (this.#returning) {
      query += ` RETURNING ${this.#returning.join(", ")}`;
    }
    return query;
  }
}
