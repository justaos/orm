import { TableDefinitionInternal } from "../types.ts";

export default class TableDefinitionError extends Error {
  constructor(field: TableDefinitionInternal, errMessages: string[]) {
    super(`[Table :: ${field.name}] \n ${errMessages.join("\n")}`);
  }
}
