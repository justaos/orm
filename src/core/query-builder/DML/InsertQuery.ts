import IQuery from "../IQuery.ts";
import ORMError from "../../../errors/ORMError.ts";
import { TPreparedStatement, TWhereClauseOperator } from "../../types.ts";
import { pgFormat } from "../../../../deps.ts";
import ColumnsListClause from "../CLAUSES/ColumnsListClause.ts";
import { getFullFormTableName } from "../../../utils.ts";

export default class InsertQuery implements IQuery {
  #intoTable?: string;

  #columnsClause?: ColumnsListClause;

  #returningClause?: ColumnsListClause;

  #values: any[] = [];

  constructor() {}

  into(tableName: string): InsertQuery {
    this.#intoTable = getFullFormTableName(tableName);
    return this;
  }

  /**
   * This method is used to set the columns for the insert query.
   * @param {string | string[] | { [key: string]: boolean }} columnNameOrObjectOrArray - The column name or object or array.
   * @param {...string[]} otherColumns - The other columns.
   * @returns {InsertQuery} The InsertQuery instance.
   */
  columns(
    columnNameOrObjectOrArray?: string | string[] | { [key: string]: boolean },
    ...otherColumns: string[]
  ): InsertQuery {
    this.#columnsClause = new ColumnsListClause(
      columnNameOrObjectOrArray,
      ...otherColumns,
    );
    return this;
  }

  /**
   * This method is used to set the returning columns for the update query.
   * @param {string | string[] | { [key: string]: boolean }} columnNameOrObjectOrArray - The column name or object or array.
   * @param {...string[]} otherColumns - The other columns.
   * @returns {InsertQuery} The UpdateQuery instance.
   */
  returning(
    columnNameOrObjectOrArray?: string | string[] | { [key: string]: boolean },
    ...otherColumns: string[]
  ): InsertQuery {
    this.#returningClause = new ColumnsListClause(
      columnNameOrObjectOrArray,
      ...otherColumns,
    );
    return this;
  }

  values(values: any[] = []): InsertQuery {
    this.#values = values;
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
     * INSERT INTO table_name
     */
    preparedStatement.sql += `INSERT into %s`;
    preparedStatement.values.push(this.#intoTable);

    if (this.#columnsClause) {
      const columnsPreparedStatement = this.#columnsClause.prepareStatement();
      preparedStatement.sql += ` (${columnsPreparedStatement.sql})`;
      preparedStatement.values.push(...columnsPreparedStatement.values);

      if (Object.keys(this.#values).length <= 0) {
        throw ORMError.queryError(
          "The set values are required for the insert query. Please check and try again.",
        );
      }
      if (this.#values) {
        this.#values.forEach((row) => {
          preparedStatement.sql += ` VALUES (%L)`;
          preparedStatement.values.push(
            columnsPreparedStatement.values.map((column: string): any => {
              return row[column];
            }),
          );
        });
      }
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
