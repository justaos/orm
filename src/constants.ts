type DatabaseOperationType = "CREATE" | "READ" | "UPDATE" | "DELETE";

enum OPERATION_TYPES {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}

type DatabaseOperationWhen = "BEFORE" | "AFTER";

enum OPERATION_WHENS {
  BEFORE = "BEFORE",
  AFTER = "AFTER"
}

export { OPERATION_TYPES, OPERATION_WHENS };

export type { DatabaseOperationType, DatabaseOperationWhen };
