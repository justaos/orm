import type { TOrderBy, TOrderByDirection } from "../../types.ts";
import ORMError from "../../../errors/ORMError.ts";
import type IClause from "./IClause.ts";

export default class OrderByClause implements IClause {
  #orderByList: TOrderBy[] = [];

  constructor(
    columnNameOrOrderList?: string | TOrderBy[],
    direction?: TOrderByDirection,
  ) {
    if (typeof columnNameOrOrderList === "undefined") {
      throw ORMError.queryError("The column name or order list is required");
    }
    if (typeof columnNameOrOrderList === "string") {
      this.#orderByList.push({
        column: columnNameOrOrderList,
        order: direction || "ASC",
      });
      return this;
    }
    if (Array.isArray(columnNameOrOrderList)) {
      this.#orderByList.push(...columnNameOrOrderList);
      return this;
    }
  }

  toJSON(): TOrderBy[] {
    return this.#orderByList;
  }

  prepareStatement(): { sql: string; values: any[] } {
    const preparedStatement: any = {
      sql: "",
      values: [],
    };
    if (this.#orderByList.length === 0) {
      return preparedStatement;
    }

    preparedStatement.sql += " ORDER BY";
    this.#orderByList.forEach((orderBy, index) => {
      preparedStatement.sql += ` %I ${orderBy.order}`;
      preparedStatement.values.push(orderBy.column);
      if (index < this.#orderByList.length - 1) {
        preparedStatement.sql += ",";
      }
    });

    return preparedStatement;
  }
}
