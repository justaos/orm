import IQuery from "../IQuery.ts";
import ORMError from "../../../errors/ORMError.ts";
import { TPreparedStatement, TWhereClauseOperator } from "../../types.ts";
import WhereClause from "../CLAUSES/WhereClause.ts";
import { pgFormat } from "../../../../deps.ts";
import ColumnsListClause from "../CLAUSES/ColumnsListClause.ts";
import { getFullFormTableName } from "../../../utils.ts";

export default class UpdateQuery implements IQuery {
  #intoTable?: string;

  #whereClause: WhereClause = new WhereClause();

  #returningClause?: ColumnsListClause;

  #setDetails: { [key: string]: any } = {};

  constructor() {}

  into(tableName: string): UpdateQuery {
    this.#intoTable = getFullFormTableName(tableName);
    return this;
  }

  /**
   * This method is used to set the AND where clause for the delete query.
   *
   * @param {string | number | boolean | ((subClause: WhereClause) => void)} columnOrCompoundFunction - The column or compound function.
   * @param {TWhereClauseOperator | any} operatorOrValue - The operator or value.
   * @param {any} value - The value.
   * @returns {UpdateQuery} The UpdateQuery instance.
   */
  where(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: WhereClause) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): UpdateQuery {
    this.#whereClause.where(columnOrCompoundFunction, operatorOrValue, value);
    return this;
  }

  /**
   * This method is used to set the AND where clause for the delete query. (same as where)
   *
   * @param {string | number | boolean | ((subClause: WhereClause) => void)} columnOrCompoundFunction - The column or compound function.
   * @param {TWhereClauseOperator | any} operatorOrValue - The operator or value.
   * @param {any} value - The value.
   * @returns {UpdateQuery} The UpdateQuery instance.
   */
  andWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: WhereClause) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): UpdateQuery {
    return this.where(columnOrCompoundFunction, operatorOrValue, value);
  }

  /**
   * This method is used to set the or where clause for the delete query.
   *
   * @param columnOrCompoundFunction
   * @param operatorOrValue
   * @param value
   * @returns {UpdateQuery} The UpdateQuery instance.
   */
  orWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: WhereClause) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ): UpdateQuery {
    this.#whereClause.orWhere(columnOrCompoundFunction, operatorOrValue, value);
    return this;
  }

  /**
   * This method is used to set the returning columns for the update query.
   * @param {string | string[] | { [key: string]: boolean }} columnNameOrObjectOrArray - The column name or object or array.
   * @param {...string[]} otherColumns - The other columns.
   * @returns {UpdateQuery} The UpdateQuery instance.
   */
  returning(
    columnNameOrObjectOrArray?: string | string[] | { [key: string]: boolean },
    ...otherColumns: string[]
  ): UpdateQuery {
    this.#returningClause = new ColumnsListClause(
      columnNameOrObjectOrArray,
      ...otherColumns,
    );
    return this;
  }

  set(
    columnOrRecord: string | { [key: string]: any },
    value?: any,
  ): UpdateQuery {
    if (typeof columnOrRecord === "object") {
      this.#setDetails = {
        ...this.#setDetails,
        ...columnOrRecord,
      };
    } else {
      this.#setDetails[columnOrRecord] = value;
    }
    return this;
  }

  buildQuery(): string {
    const preparedStatement: TPreparedStatement = {
      sql: "",
      values: [],
    };

    if (!this.#intoTable) {
      throw ORMError.queryError(
        "The table name is required for the update query. Please check and try again.",
      );
    }

    /**
     * UPDATE INTO table_name
     */
    preparedStatement.sql += `UPDATE %s`;
    preparedStatement.values.push(this.#intoTable);

    if (Object.keys(this.#setDetails).length <= 0) {
      throw ORMError.queryError(
        "The set values are required for the update query. Please check and try again.",
      );
    }
    preparedStatement.sql += ` SET ${
      Object.keys(this.#setDetails)
        .map((item) => {
          return `%I = %L`;
        })
        .join(", ")
    }`;

    Object.keys(this.#setDetails).forEach((key) => {
      preparedStatement.values.push(key, this.#setDetails[key]);
    });

    /**
     * WHERE condition
     */
    const whereStatement = this.#whereClause.prepareStatement();
    if (whereStatement.sql) {
      preparedStatement.sql += whereStatement.sql;
      preparedStatement.values.push(...whereStatement.values);
    }

    /**
     * RETURNING columns
     */
    if (this.#returningClause) {
      const columnsPreparedStatement = this.#returningClause.prepareStatement();
      preparedStatement.sql += ` RETURNING ${columnsPreparedStatement.sql}`;
      preparedStatement.values.push(...columnsPreparedStatement.values);
    }

    return pgFormat(preparedStatement.sql, ...preparedStatement.values);
  }
}
