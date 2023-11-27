import { ColumnDefinition, ColumnDefinitionRaw } from "./ColumnDefinition.ts";

type TableDefinitionRaw = {
  schema?: string;
  name: string;
  inherits?: string;
  final?: boolean;
  columns?: ColumnDefinitionRaw[];
};

type TableDefinition = {
  schema: string;
  name: string;
  inherits?: string;
  final: boolean;
  columns: ColumnDefinition[];
};



export type { TableDefinitionRaw, TableDefinition };
