import TableNameUtils from "../table/TableNameUtils.ts";

export default class DeleteQuery {
  #where: any[] = [];

  #from?: string;

  constructor() {}

  from(tableName: string): DeleteQuery {
    this.#from = TableNameUtils.getFullFormTableName(tableName);
    return this;
  }

  where(
    column: string | number | boolean,
    operator: any,
    value?: any
  ): DeleteQuery {
    // Support "where true || where false"
    if (column === false || column === true) {
      return this.where(1, "=", column ? 1 : 0);
    }
    if (typeof value === "undefined") {
      return this.where(column, "=", operator);
    }

    this.#where.push({
      column,
      operator,
      value,
    });

    return this;
  }

  buildQuery(): string {
    let query = `DELETE FROM ${this.#from}`;
    query = query + this.#prepareWhereClause();
    return query;
  }

  #prepareWhereClause(): string {
    if (this.#where.length === 0) {
      return "";
    }
    return (
      " WHERE " +
      this.#where
        .map((where) => {
          return `"${where.column}" ${where.operator} '${where.value}'`;
        })
        .join(" AND ")
    );
  }
}
