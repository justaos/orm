import { TableSchemaDefinitionStrict } from "../table/definitions/TableSchemaDefinition.ts";

export default class TableDefinitionError extends Error {
  constructor(field: TableSchemaDefinitionStrict, errMessages: string[]) {
    super(`[Table :: ${field.name}] \n ${errMessages.join("\n")}`);
  }
}
