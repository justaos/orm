import type IQuery from "../IQuery.ts";
import { pgFormat } from "../../../../deps.ts";
import WhereClause from "../CLAUSES/WhereClause.ts";
import type {
  TOrderBy,
  TOrderByDirection,
  TPreparedStatement,
  TWhereClauseOperator,
} from "../../types.ts";
import ORMError from "../../../errors/ORMError.ts";
import type IClause from "../CLAUSES/IClause.ts";
import LimitClause from "../CLAUSES/LimitClause.ts";
import OffsetClause from "../CLAUSES/OffsetClause.ts";
import GroupByClause from "../CLAUSES/GroupByClause.ts";
import OrderByClause from "../CLAUSES/OrderByClause.ts";
import ColumnsListClause from "../CLAUSES/ColumnsListClause.ts";
import { getFullFormTableName } from "../../../utils.ts";

export default class SelectQuery implements IQuery {
  #columnsClause?: ColumnsListClause;

  #tables?: string[];

  #whereClause: WhereClause = new WhereClause();

  #orderByClause?: OrderByClause;

  #offsetClause?: OffsetClause;

  #groupByClause?: GroupByClause;

  #limitClause?: LimitClause;

  constructor() {}

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
    this.#columnsClause = new ColumnsListClause(
      columnNameOrObjectOrArray,
      ...otherColumns,
    );
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

    if (this.#tables) {
      for (const tableName of this.#tables) {
        if (typeof tableName !== "string" || tableName.length <= 0) {
          throw ORMError.queryError("Table name is required");
        }
      }
      this.#tables = this.#tables.map((tableName) => {
        return getFullFormTableName(tableName);
      });
    }

    return this;
  }

  /**
   * This method is used to set the where clause for the select query.
   *
   * @param {string | number | boolean | ((where: WhereClause) => void)} columnOrCompoundFunction - The column or compound function.
   * @param {TWhereClauseOperator | any} operatorOrValue - The operator or value.
   * @param {any} value - The value.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  where(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: WhereClause) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): SelectQuery {
    this.#whereClause.where(columnOrCompoundFunction, operatorOrValue, value);
    return this;
  }

  /**
   * This method is same as where method.
   */
  andWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: WhereClause) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): SelectQuery {
    return this.where(columnOrCompoundFunction, operatorOrValue, value);
  }

  /**
   * This method is used to set the or where clause for the select query.
   *
   * @param columnOrCompoundFunction
   * @param operatorOrValue
   * @param value
   */
  orWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: WhereClause) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): SelectQuery {
    this.#whereClause.orWhere(columnOrCompoundFunction, operatorOrValue, value);
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
    this.#orderByClause = new OrderByClause(columnNameOrOrderList, direction);
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
    this.#groupByClause = new GroupByClause(
      columnNameOrObjectOrArray,
      ...otherColumns,
    );
    return this;
  }

  /**
   * This method is used to set the limit for the select query.
   * @param {number} limit - The limit.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  limit(limit: number): SelectQuery {
    this.#limitClause = new LimitClause(limit);
    return this;
  }

  /**
   * This method is used to set the offset for the select query.
   * @param {number} offset - The offset.
   * @returns {SelectQuery} The SelectQuery instance.
   */
  offset(offset: number): SelectQuery {
    this.#offsetClause = new OffsetClause(offset);
    return this;
  }

  buildQuery(): string {
    const preparedStatement: TPreparedStatement = {
      sql: "",
      values: [],
    };

    /**
     * SELECT column1, column2, ...
     */
    preparedStatement.sql += "SELECT ";
    if (this.#columnsClause) {
      const columnsPreparedStatement = this.#columnsClause.prepareStatement();
      preparedStatement.sql += columnsPreparedStatement.sql;
      preparedStatement.values.push(...columnsPreparedStatement.values);
    }

    /**
     * FROM table_name1, table_name2, ...
     */
    if (!this.#tables) {
      throw ORMError.queryError(
        "The table name is required for the SELECT Query. Please check and try again.",
      );
    }
    preparedStatement.sql += " FROM %s";
    preparedStatement.values.push(this.#tables);

    const clauses: (IClause | undefined)[] = [
      this.#whereClause,
      this.#groupByClause,
      this.#orderByClause,
      this.#limitClause,
      this.#offsetClause,
    ];

    for (const clause of clauses) {
      if (clause) {
        const compoundStatement = clause.prepareStatement();
        if (compoundStatement.sql) {
          preparedStatement.sql += compoundStatement.sql;
          preparedStatement.values.push(...compoundStatement.values);
        }
      }
    }

    return pgFormat(preparedStatement.sql, ...preparedStatement.values);
  }

  buildCountQuery(): string {
    return `SELECT COUNT(*) as count FROM (${this.buildQuery()}) as t`;
  }
}
