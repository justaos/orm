import { TableDefinition } from "../types.ts";

export default class TableDefinitionError extends Error {
  constructor(field: TableDefinition, errMessages: string[]) {
    super(`[Table :: ${field.name}] \n ${errMessages.join("\n")}`);
  }
}
