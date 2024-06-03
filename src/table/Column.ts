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
    super(columnDefinition, dataType);
  }
}
