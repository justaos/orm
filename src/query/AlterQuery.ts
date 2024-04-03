import TableNameUtils from "../table/TableNameUtils.ts";

type ColumnDefinitionNative = {
  name: string;
  data_type: string;
  not_null?: boolean;
  default?: unknown;
  unique?: boolean;
  foreign_key?: {
    table: string;
    column: string;
    on_delete?: "NO ACTION" | "CASCADE" | "SET NULL" | "SET DEFAULT";
  };
};

export type { ColumnDefinitionNative };

export class AlterQuery {
  readonly #tableName: string;

  #addColumns: ColumnDefinitionNative[] = [];

  #inherits?: string;

  constructor(tableName: string) {
    this.#tableName = TableNameUtils.getFullFormTableName(tableName);
  }

  addColumn(column: ColumnDefinitionNative): AlterQuery {
    column = { not_null: false, unique: false, ...column };
    this.#addColumns.push(column);
    return this;
  }

  buildQuery(): string {
    let query = `ALTER TABLE ${this.#tableName} \n\t`;
    query += this.#prepareColumns();
    query += this.#prepareInherits();
    return query;
  }

  #prepareColumn(column: ColumnDefinitionNative): string {
    let query = `ADD COLUMN "${column.name}" ${column.data_type}`;
    if (column.foreign_key) {
      const onDelete = column.foreign_key.on_delete
        ? ` ON DELETE ${column.foreign_key.on_delete}`
        : "";
      query += ` REFERENCES ${
        TableNameUtils.getFullFormTableName(
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
