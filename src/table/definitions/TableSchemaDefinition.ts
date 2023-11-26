import {
  ColumnSchemaDefinition,
  ColumnSchemaDefinitionStrict
} from "./ColumnSchemaDefinition.ts";

type TableSchemaDefinition = {
  schema?: string;
  name: string;
  extends?: string;
  final?: boolean;
  columns?: ColumnSchemaDefinition[];
};

type TableSchemaDefinitionStrict = {
  schema: string;
  name: string;
  extends?: string;
  final: boolean;
  columns: ColumnSchemaDefinitionStrict[];
};

export type { TableSchemaDefinition, TableSchemaDefinitionStrict };
