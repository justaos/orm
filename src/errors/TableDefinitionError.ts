import { TableDefinition } from "../table/definitions/TableDefinition.ts";

export default class TableDefinitionError extends Error {
  constructor(field: TableDefinition, errMessages: string[]) {
    super(`[Table :: ${field.name}] \n ${errMessages.join("\n")}`);
  }
}
