import SelectQuery from "./SelectQuery.ts";
import { DatabaseErrorCode, ODMError } from "../errors/ODMError.ts";

export default class Query {
  #sql: any;

  #query?: SelectQuery; // | UpdateQuery | DeleteQuery | InsertQuery;

  #nameWithSchema?: string;

  constructor(sql: any, nameWithSchema: string) {
    this.#sql = sql;
    this.#nameWithSchema = nameWithSchema;
  }

  select(...args: any[]): Query {
    this.#query = new SelectQuery();
    if (this.#nameWithSchema) this.#query.from(this.#nameWithSchema);
    return this;
  }

  from(nameWithSchema: string): Query {
    if (!this.#query)
      throw new ODMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Query not initialized"
      );
    this.#nameWithSchema = nameWithSchema;
    const query = <SelectQuery>this.#query;
    query.from(this.#nameWithSchema);
    return this;
  }
}
