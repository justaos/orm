import { getFullFormTableName } from "../utils.ts";
import type { __TColumnDefinitionNative } from "../types.ts";

export class CreateQuery {
  readonly #tableName: string;

  #columns: __TColumnDefinitionNative[] = [];

  #inherits?: string;

  constructor(tableName: string) {
    this.#tableName = getFullFormTableName(tableName);
  }

  addColumn(column: __TColumnDefinitionNative): CreateQuery {
    column = { ...column };
    this.#columns.push(column);
    return this;
  }

  inherits(tableName: string): CreateQuery {
    this.#inherits = getFullFormTableName(tableName);
    return this;
  }

  buildQuery(): string {
    let query = `CREATE TABLE ${this.#tableName}`;
    query += ` (`;
    query += this.#prepareColumns();
    query += this.#prepareUnique();
    query += this.#preparePrimaryKey();
    query += `)`;
    query += this.#prepareInherits();
    return query;
  }

  #prepareColumn(column: __TColumnDefinitionNative): string {
    let query = `"${column.name}" ${column.native_type}`;
    if (column.foreign_key) {
      const onDelete = column.foreign_key.on_delete
        ? ` ON DELETE ${column.foreign_key.on_delete}`
        : "";
      query += ` REFERENCES ${
        getFullFormTableName(
          column.foreign_key.table,
        )
      } ("${column.foreign_key.column}") ${onDelete}`;
    } else {
      if (column.not_null) query += ` NOT NULL`;
      if (column.unique) query += ` UNIQUE`;
    }
    return query;
  }

  #prepareColumns(): string {
    return this.#columns
      .filter((column) =>
        getFullFormTableName(column.table) === this.#tableName
      )
      .map((column) => {
        return this.#prepareColumn(column);
      })
      .join(",\n\t");
  }

  #prepareInherits(): string {
    if (!this.#inherits) return "";
    return ` INHERITS (${this.#inherits})`;
  }

  #prepareUnique(): string {
    const uniqueColumns = this.#columns.filter((column) =>
      column.name != "id" && column.unique &&
      getFullFormTableName(column.table) !== this.#tableName
    );
    if (uniqueColumns.length === 0) return "";
    return uniqueColumns.map((column) => {
      return `,  UNIQUE ("${column.name}")`;
    }).join("");
  }

  #preparePrimaryKey(): string {
    return `, PRIMARY KEY (id)`;
  }
}
