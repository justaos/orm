import ColumnDefinitionHandler from "./ColumnDefinitionHandler.ts";
import type { TColumnDefinition } from "../types.ts";
import type RegistriesHandler from "../RegistriesHandler.ts";

export default class Column extends ColumnDefinitionHandler {
  constructor(
    columnDefinition: TColumnDefinition,
    registriesHandler: RegistriesHandler,
  ) {
    const dataType = registriesHandler.getDataType(columnDefinition.type);
    super(columnDefinition, dataType);
  }
}
