export default class DeleteQuery {
  #where: any[] = [];

  #from?: string;

  constructor(nameWithSchema: string) {
    this.#from = nameWithSchema;
  }

  where(column: any, operator: any, value?: any): DeleteQuery {
    // Support "where true || where false"
    if (column === false || column === true) {
      return this.where(1, "=", column ? 1 : 0);
    }
    if (arguments.length === 2) {
      return this.where(column, "=", operator);
    }

    this.#where.push({
      column,
      operator,
      value
    });

    return this;
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

  buildDeleteQuery(): string {
    let query = `DELETE FROM ${this.#from}`;
    query = query + this.#prepareWhereClause();
    return query;
  }
}
