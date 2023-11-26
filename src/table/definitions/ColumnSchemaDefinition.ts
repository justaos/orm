type ColumnSchemaDefinition = {
  name: string;
  type?: string;
  not_null?: boolean;
  default?: unknown;
  unique?: boolean;
};

type ColumnSchemaDefinitionStrict = {
  name: string;
  type: string;
  not_null: boolean;
  default?: unknown;
  unique: boolean;
};

export type { ColumnSchemaDefinition, ColumnSchemaDefinitionStrict };
