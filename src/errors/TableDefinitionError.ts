import { TableDefinitionInternal } from "../types.ts";
import { ORMError } from "./ORMError.ts";

export default class TableDefinitionError extends ORMError {
  constructor(tableName: string, cause: any) {
    super(
      "TABLE_DEFINITION_VALIDATION",
      `Table definition error: ${tableName}`,
      cause,
    );
  }
}
