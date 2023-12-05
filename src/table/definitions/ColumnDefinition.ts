type ColumnDefinitionRaw = {
  name: string;
  type?: string;
  not_null?: boolean;
  default?: unknown;
  unique?: boolean;
};

type ColumnDefinition = {
  name: string;
  type: string;
  not_null: boolean;
  default?: unknown;
  unique: boolean;
};

export type { ColumnDefinitionRaw, ColumnDefinition };
