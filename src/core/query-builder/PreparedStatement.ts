export default class PreparedStatement {
  #sql: string;
  #values: any[];

  constructor(sql: string = "", values: any[] = []) {
    this.#sql = sql;
    this.#values = values;
  }

  setSQL(sql: string): void {
    this.#sql = sql;
  }

  getSQL(): string {
    return this.#sql;
  }

  getValues(): any[] {
    return this.#values;
  }

  merge(preparedStatement: PreparedStatement): PreparedStatement {
    this.mergePlain(preparedStatement.getSQL(), preparedStatement.getValues());
    return this;
  }

  mergePlain(sql: string, values: any[] = []): PreparedStatement {
    if (this.#sql) {
      this.#sql += ` ${sql}`;
    } else {
      this.#sql = sql;
    }
    this.#values.push(...values);
    return this;
  }
}
