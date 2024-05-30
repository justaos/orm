import { JSONObject, JSONPrimitive } from "../deps.ts";

export type DatabaseOperationType = "INSERT" | "SELECT" | "UPDATE" | "DELETE";
export type DatabaseOperationWhen = "BEFORE" | "AFTER";

export type ColumnDefinitionRaw = {
  name: string;
  type?: string;
  not_null?: boolean;
  default?: unknown;
  unique?: boolean;
  foreign_key?: {
    table: string;
    column: string;
    on_delete?: "NO ACTION" | "CASCADE" | "SET NULL" | "SET DEFAULT";
  };
};

export type ColumnDefinition = {
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

export type TableDefinitionRaw = {
  schema?: string;
  name: string;
  inherits?: string;
  final?: boolean;
  columns?: ColumnDefinitionRaw[];
};

export type TableDefinition = {
  schema: string;
  name: string;
  inherits?: string;
  final: boolean;
  columns: ColumnDefinition[];
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
} & JSONObject;

export type DatabaseOperationContext = JSONObject;

export type SimpleCondition = {
  column: string | number;
  operator: string;
  value: JSONPrimitive | JSONPrimitive[];
};
