import { SqlString } from "../../deps.ts";
import { DatabaseErrorCode, ODMError } from "../errors/ODMError.ts";
import { JSONObject } from "../types.ts";

export default class InsertQuery {
  #tableName?: string;
  #columns?: string[];
  #rows?: any[];
  #returning?: string[];

  constructor() {}

  into(nameWithSchema: string): InsertQuery {
    this.#tableName = nameWithSchema;
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
          throw new Error("Invalid argument");
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
          throw new Error("Invalid argument");
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
      throw new ODMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Columns not defined"
      );
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

  #escapeValue(value: any): string {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      return SqlString.escape(value);
    }
    if (typeof value === "object") {
      return `'${JSON.stringify(value)}'`;
    }
    return String(value);
  }

  #getRowWithSelectedColumns(row: JSONObject): string[] {
    const newRow: string[] = [];
    this.#columns?.forEach((column: string) => {
      newRow.push(this.#escapeValue(row[column]));
    });
    return newRow;
  }
}
