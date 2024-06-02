import ColumnDefinitionHandler from "./ColumnDefinitionHandler.ts";
import { ColumnDefinition } from "../types.ts";
import RegistriesHandler from "../RegistriesHandler.ts";

export default class Column extends ColumnDefinitionHandler {
  constructor(
    columnDefinition: ColumnDefinition,
    registriesHandler: RegistriesHandler,
  ) {
    const dataType = registriesHandler.dataTypeRegistry.get(
      columnDefinition.type,
    );
    if (!dataType) {
      throw new Error(`No such data type: ${columnDefinition.type}`);
    }
    super(columnDefinition, dataType);
  }
}
