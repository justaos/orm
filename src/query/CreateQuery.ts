import { getFullFormTableName } from "../utils.ts";
import type { ColumnDefinitionInternal } from "../types.ts";

export class CreateQuery {
  readonly #tableName: string;

  #columns: ColumnDefinitionInternal[] = [];

  #inherits?: string;

  constructor(tableName: string) {
    this.#tableName = getFullFormTableName(tableName);
  }

  addColumn(column: ColumnDefinitionInternal): CreateQuery {
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
    query += this.#preparePrimaryKey();
    query += `)`;
    query += this.#prepareInherits();
    return query;
  }

  #prepareColumn(column: ColumnDefinitionInternal): string {
    let query = `"${column.name}" ${column.data_type}`;
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
      .map((column) => {
        return this.#prepareColumn(column);
      })
      .join(",\n\t");
  }

  #prepareInherits(): string {
    if (!this.#inherits) return "";
    return ` INHERITS (${this.#inherits})`;
  }

  #preparePrimaryKey(): string {
    if (this.#inherits) return "";
    return `, PRIMARY KEY (id)`;
  }
}
