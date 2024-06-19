import ORMError from "../../../errors/ORMError.ts";
import IClause from "./IClause.ts";

export default class ColumnsListClause implements IClause {
  #columns: string[] = ["*"];

  constructor(
    columnNameOrObjectOrArray?: string | string[] | { [key: string]: boolean },
    ...otherColumns: string[]
  ) {
    if (
      typeof columnNameOrObjectOrArray === "undefined" ||
      columnNameOrObjectOrArray === null
    ) {
      this.#columns = ["*"];
    }
    if (typeof columnNameOrObjectOrArray === "string") {
      if (otherColumns.length > 0) {
        this.#columns = [columnNameOrObjectOrArray, ...otherColumns];
      } else {
        this.#columns = [columnNameOrObjectOrArray];
      }
    } else if (Array.isArray(columnNameOrObjectOrArray)) {
      this.#columns = columnNameOrObjectOrArray;
    } else if (typeof columnNameOrObjectOrArray === "object") {
      this.#columns = Object.keys(columnNameOrObjectOrArray);
    }
    this.#columns.map((arg) => {
      if (typeof arg === "object") {
        throw ORMError.queryError(
          "The columns parameter provided is incorrect. Please check and try again.",
        );
      }
      return arg;
    });
  }

  prepareStatement(): { sql: string; values: any[] } {
    const preparedStatement: any = {
      sql: "",
      values: [],
    };
    this.#columns.forEach((column, index) => {
      if (
        typeof column === "boolean" ||
        typeof column === "number" ||
        column === "*" ||
        column.toUpperCase().includes("COUNT(") ||
        column.toUpperCase().includes("SUM(") ||
        column.toUpperCase().includes("AVG(") ||
        column.toUpperCase().includes("MAX(") ||
        column.toUpperCase().includes("MIN(")
      ) {
        preparedStatement.sql += `%s`;
        preparedStatement.values.push(column);
      } else {
        preparedStatement.sql += `%I`;
        preparedStatement.values.push(column);
      }
      if (index < this.#columns.length - 1) {
        preparedStatement.sql += ", ";
      }
    });
    return preparedStatement;
  }
}
