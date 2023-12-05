type NativeDataType =
  | "VARCHAR"
  | "UUID"
  | "CHAR"
  | "TEXT"
  | "decimal"
  | "integer"
  | "boolean"
  | "date"
  | "json"
  | "timestamp";

enum NATIVE_DATA_TYPES {
  VARCHAR = "VARCHAR",
  UUID = "UUID",
  CHAR = "CHAR",
  TEXT = "TEXT",
  NUMBER = "number",
  INTEGER = "integer",
  BOOLEAN = "boolean",
  DATE = "date",
  JSON = "json",
  TIMESTAMP = "timestamp",
}

export { NATIVE_DATA_TYPES };
export type { NativeDataType };
