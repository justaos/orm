import { getFullFormTableName } from "../utils.ts";
import WhereClause from "./WhereClause.ts";

export default class DeleteQuery extends WhereClause {
  #from?: string;

  constructor() {
    super();
  }

  from(tableName: string): DeleteQuery {
    this.#from = getFullFormTableName(tableName);
    return this;
  }

  buildQuery(): string {
    let query = `DELETE FROM ${this.#from}`;
    query = query + this.prepareWhereClause();
    return query;
  }
}
