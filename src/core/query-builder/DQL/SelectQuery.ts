import IQuery from "../IQuery.ts";
import { pgFormat } from "../../../../deps.ts";
import ExpressionBuilder from "../EXPRESSIONS/ExpressionBuilder.ts";
import {
  TOrderBy,
  TOrderByDirection,
  TPreparedStatement,
  TWhereClauseOperator,
} from "../../types.ts";
import ORMError from "../../../errors/ORMError.ts";

export default class SelectQuery extends IQuery {
  #columns: string[] = ["*"];

  #tables?: string[];

  #where?: ExpressionBuilder;

  #orderByList: TOrderBy[] = [];

  #offset?: number;

  #groupBy?: string[];

  #limit?: number;

  constructor() {
    super();
  }

  /**
   * This method is used to set the columns for the select query.
   * @param {string | string[] | { [key: string]: boolean }} columnNameOrObjectOrArray - The column name or object or array.
   * @param {...string[]} otherColumns - The other columns.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  columns(
    columnNameOrObjectOrArray?: string | string[] | { [key: string]: boolean },
    ...otherColumns: string[]
  ): SelectQuery {
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
          "The columns parameter provided for SelectQuery is incorrect. Please check and try again.",
        );
      }
      return arg;
    });
    return this;
  }

  /**
   * This method is used to set the table or tables for the select query.
   * @param {string | string[]} tableOrTablesArray - The table or tables array.
   * @param {...string[]} otherTableNames - The other table names.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  from(
    tableOrTablesArray: string | string[],
    ...otherTableNames: string[]
  ): SelectQuery {
    if (
      typeof tableOrTablesArray === "undefined" ||
      tableOrTablesArray === null
    ) {
      throw ORMError.queryError("Table name is required");
    }
    if (typeof tableOrTablesArray === "string") {
      if (tableOrTablesArray.length > 0) {
        this.#tables = [tableOrTablesArray, ...otherTableNames];
      } else {
        this.#tables = [tableOrTablesArray];
      }
    } else if (Array.isArray(tableOrTablesArray)) {
      this.#tables = tableOrTablesArray;
    }
    return this;
  }

  /**
   * This method is used to set the where clause for the select query.
   * @param {string | number | boolean | ((where: ExpressionBuilder) => void)} columnOrCompoundFunction - The column or compound function.
   * @param {TWhereClauseOperator | any} operatorOrValue - The operator or value.
   * @param {any} value - The value.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  where(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): SelectQuery {
    this.#where = new ExpressionBuilder();
    this.#where.where(columnOrCompoundFunction, operatorOrValue, value);
    return this;
  }

  andWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): SelectQuery {
    if (!this.#where) {
      this.where(columnOrCompoundFunction, operatorOrValue, value);
    } else {
      this.#where.andWhere(columnOrCompoundFunction, operatorOrValue, value);
    }
    return this;
  }

  orWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): SelectQuery {
    if (!this.#where) {
      this.where(columnOrCompoundFunction, operatorOrValue, value);
    } else {
      this.#where.orWhere(columnOrCompoundFunction, operatorOrValue, value);
    }
    return this;
  }

  /**
   * This method is used to set the order by clause for the select query.
   * @param {string | TOrderBy[]} columnNameOrOrderList - The column name or order list.
   * @param {TOrderByDirection} direction - The direction.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  orderBy(
    columnNameOrOrderList?: string | TOrderBy[],
    direction?: TOrderByDirection,
  ): SelectQuery {
    if (typeof columnNameOrOrderList === "undefined") {
      return this;
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
    return this;
  }

  /**
   * This method is used to set the group by clause for the select query.
   * @returns {SelectQuery} The SelectQuery instance.
   * @param columnNameOrObjectOrArray
   * @param otherColumns
   */
  groupBy(
    columnNameOrObjectOrArray?: string | string[] | { [key: string]: boolean },
    ...otherColumns: string[]
  ): SelectQuery {
    if (
      typeof columnNameOrObjectOrArray === "undefined" ||
      columnNameOrObjectOrArray === null
    ) {
      throw ORMError.queryError(
        "The columns parameter provided for SelectQuery is incorrect. Please check and try again.",
      );
    }
    if (typeof columnNameOrObjectOrArray === "string") {
      if (otherColumns.length > 0) {
        this.#groupBy = [columnNameOrObjectOrArray, ...otherColumns];
      } else {
        this.#groupBy = [columnNameOrObjectOrArray];
      }
    } else if (Array.isArray(columnNameOrObjectOrArray)) {
      this.#groupBy = columnNameOrObjectOrArray;
    } else if (typeof columnNameOrObjectOrArray === "object") {
      this.#groupBy = Object.keys(columnNameOrObjectOrArray);
    }
    this.#groupBy?.map((arg) => {
      if (typeof arg === "object") {
        throw ORMError.queryError(
          "The groupBy parameter provided for SelectQuery is incorrect. Please check and try again.",
        );
      }
      return arg;
    });
    return this;
  }

  /**
   * This method is used to set the limit for the select query.
   * @param {number} limit - The limit.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  limit(limit: number): SelectQuery {
    if (limit < 0 || isNaN(limit)) {
      throw ORMError.queryError(
        "The limit provided for SelectQuery is incorrect. Please check and try again.",
      );
    }
    this.#limit = limit;
    return this;
  }

  /**
   * This method is used to set the offset for the select query.
   * @param {number} offset - The offset.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  offset(offset: number): SelectQuery {
    if (offset < 0 || isNaN(offset)) {
      throw ORMError.queryError(
        "The offset provided for SelectQuery is incorrect. Please check and try again.",
      );
    }
    this.#offset = offset;
    return this;
  }

  buildQuery(): string {
    const preparedStatement: TPreparedStatement = {
      sql: "",
      values: [],
    };
    if (this.#columns) {
      preparedStatement.sql += "SELECT ";
      this.#columns.forEach((column, index) => {
        if (column === "*" || column.toUpperCase().includes("COUNT")) {
          preparedStatement.sql += `%s`;
          preparedStatement.values.push(column);
        } else {
          preparedStatement.sql += `%I`;
          preparedStatement.values.push(column);
        }
        if (index < this.#columns.length - 1) {
          preparedStatement.sql += ",";
        }
      });
    }

    if (this.#tables) {
      preparedStatement.sql += " FROM %I";
      preparedStatement.values.push(this.#tables);
    }

    if (this.#where) {
      const whereStatement = this.#where.prepareStatement();
      preparedStatement.sql += ` WHERE ${whereStatement.sql}`;
      preparedStatement.values.push(...whereStatement.values);
    }
    if (this.#groupBy) {
      preparedStatement.sql += " GROUP BY %I";
      preparedStatement.values.push(this.#groupBy);
    }
    if (this.#orderByList.length > 0) {
      preparedStatement.sql += " ORDER BY";
      this.#orderByList.forEach((orderBy, index) => {
        preparedStatement.sql += ` %I ${orderBy.order}`;
        preparedStatement.values.push(orderBy.column);
        if (index < this.#orderByList.length - 1) {
          preparedStatement.sql += ",";
        }
      });
    }
    if (this.#limit) {
      preparedStatement.sql += " LIMIT %s";
      preparedStatement.values.push(this.#limit);
    }
    if (this.#offset) {
      preparedStatement.sql += " OFFSET %s";
      preparedStatement.values.push(this.#offset);
    }
    return pgFormat(preparedStatement.sql, ...preparedStatement.values);
  }

  buildCountQuery(): string {
    const preparedStatement: TPreparedStatement = {
      sql: "",
      values: [],
    };
    preparedStatement.sql = "SELECT COUNT(*) as count FROM (SELECT * FROM %I";
    preparedStatement.values = [this.#tables];
    if (this.#where) {
      const whereStatement = this.#where.prepareStatement();
      preparedStatement.sql += ` WHERE ${whereStatement.sql}`;
      preparedStatement.values.push(...whereStatement.values);
    }
    if (this.#groupBy) {
      preparedStatement.sql += " GROUP BY %I";
      preparedStatement.values.push(this.#groupBy);
    }
    if (this.#limit) {
      preparedStatement.sql += " LIMIT %s";
      preparedStatement.values.push(this.#limit);
    }
    if (this.#offset) {
      preparedStatement.sql += " OFFSET %s";
      preparedStatement.values.push(this.#offset);
    }
    preparedStatement.sql += ") as t";
    return pgFormat(preparedStatement.sql, ...preparedStatement.values);
  }
}
