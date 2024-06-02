import { getFullFormTableName } from "../utils.ts";
import { ColumnDefinitionInternal } from "../types.ts";

export class AlterQuery {
  readonly #tableName: string;

  #addColumns: ColumnDefinitionInternal[] = [];

  #inherits?: string;

  constructor(tableName: string) {
    this.#tableName = getFullFormTableName(tableName);
  }

  addColumn(column: ColumnDefinitionInternal): AlterQuery {
    column = { ...column };
    this.#addColumns.push(column);
    return this;
  }

  buildQuery(): string {
    let query = `ALTER TABLE ${this.#tableName} \n\t`;
    query += this.#prepareColumns();
    query += this.#prepareInherits();
    return query;
  }

  #prepareColumn(column: ColumnDefinitionInternal): string {
    let query = `ADD COLUMN "${column.name}" ${column.data_type}`;
    if (column.foreign_key) {
      const onDelete = column.foreign_key.on_delete
        ? ` ON DELETE ${column.foreign_key.on_delete}`
        : "";
      query += ` REFERENCES ${getFullFormTableName(
        column.foreign_key.table,
      )} ("${column.foreign_key.column}") ${onDelete}`;
    } else {
      if (column.not_null) query += ` NOT NULL`;
      if (column.unique) query += ` UNIQUE`;
    }
    return query;
  }

  #prepareColumns(): string {
    return this.#addColumns
      .map((column) => {
        return this.#prepareColumn(column);
      })
      .join("\n\t");
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
