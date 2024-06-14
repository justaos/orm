import type { JSONPrimitive } from "../deps.ts";

/**
 * Database operation type
 * @type {string}
 * @enum {"INSERT" | "SELECT" | "UPDATE" | "DELETE"}
 */
export type DatabaseOperationType = "INSERT" | "SELECT" | "UPDATE" | "DELETE";
export type DatabaseOperationWhen = "BEFORE" | "AFTER";

export type CompoundOperator = "OR" | "AND";

export type ColumnDefinition = {
  name: string;
  type: string;
  not_null?: boolean;
  default?: unknown;
  unique?: boolean;
  foreign_key?: {
    table: string;
    column: string;
    on_delete?: "NO ACTION" | "CASCADE" | "SET NULL" | "SET DEFAULT";
  };
};

export type ColumnDefinitionInternal = {
  name: string;
  type: string;
  data_type?: string;
  not_null: boolean;
  default?: unknown;
  unique: boolean;
  foreign_key?: {
    table: string;
    column: string;
    on_delete?: "NO ACTION" | "CASCADE" | "SET NULL" | "SET DEFAULT";
  };
};

export type TableDefinition = {
  schema?: string;
  name: string;
  inherits?: string;
  final?: boolean;
  columns?: ColumnDefinition[];
};

export type TableDefinitionInternal = {
  schema: string;
  name: string;
  inherits?: string;
  final: boolean;
  columns: ColumnDefinitionInternal[];
};

export type NativeDataType =
  | "VARCHAR"
  | "UUID"
  | "CHAR"
  | "TEXT"
  | "DECIMAL"
  | "INTEGER"
  | "BOOLEAN"
  | "DATE"
  | "JSON"
  | "TIME"
  | "TIMESTAMP";

export type RawRecord = {
  id?: string;
  _table?: string;
  [key: string]: unknown;
};

export type DatabaseOperationContext = {
  [key: string]: unknown;
};

export type SimpleCondition = {
  column: string | number;
  operator: string;
  value: JSONPrimitive | JSONPrimitive[];
};

export type OrderByDirectionType = "ASC" | "DESC";

export type OrderByType = {
  column: string;
  order: OrderByDirectionType;
};
