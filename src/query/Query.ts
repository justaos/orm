import SelectQuery from "./SelectQuery.ts";
import { DatabaseErrorCode, ORMError } from "../errors/ORMError.ts";
import DeleteQuery from "./DeleteQuery.ts";
import { ColumnDefinitionNative, CreateQuery } from "./CreateQuery.ts";
import InsertQuery from "./InsertQuery.ts";
import UpdateQuery from "./UpdateQuery.ts";
import { AlterQuery } from "./AlterQuery.ts";
import { OrderByDirectionType, OrderByType } from "../table/query/OrderByType.ts";

export default class Query {
  readonly #sql: any;

  #query?: SelectQuery | DeleteQuery | CreateQuery | InsertQuery | UpdateQuery | AlterQuery;

  constructor(sql: any) {
    this.#sql = sql;
  }

  getInstance(): Query {
    return new Query(this.#sql);
  }

  getClone(): Query {
    const query = new Query(this.#sql);
    query.setQuery(this.#query);
    return query
  }

  setQuery(query: SelectQuery | DeleteQuery | CreateQuery | InsertQuery | UpdateQuery | AlterQuery | undefined){
    this.#query = query;
  }

  getType(): string | undefined {
    if (this.#query instanceof SelectQuery) return "select";
    if (this.#query instanceof DeleteQuery) return "delete";
    if (this.#query instanceof CreateQuery) return "create";
    if (this.#query instanceof InsertQuery) return "insert";
  }

  /* Create query */
  create(nameWithSchema: string): Query {
    this.#query = new CreateQuery(nameWithSchema);
    return this;
  }

  alter(nameWithSchema: string): Query {
    this.#query = new AlterQuery(nameWithSchema);
    return this;
  }

  addColumn(column: ColumnDefinitionNative): Query {
    const query = <CreateQuery>this.#getQuery();
    query.addColumn(column);
    return this;
  }

  inherits(nameWithSchema: string | undefined): Query {
    if (typeof nameWithSchema === "undefined") return this;
    const query = <CreateQuery>this.#getQuery();
    query.inherits(nameWithSchema);
    return this;
  }

  /* Insert query */
  insert(): Query {
    this.#query = new InsertQuery();
    return this;
  }

  into(nameWithSchema: string): Query {
    const query = <InsertQuery>this.#getQuery();
    query.into(nameWithSchema);
    return this;
  }

  columns(...args: any[]): Query {
    const query = <InsertQuery>this.#getQuery();
    query.columns(...args);
    return this;
  }

  values(rows: any[]): Query {
    const query = <InsertQuery>this.#getQuery();
    query.values(rows);
    return this;
  }

  returning(...args: any[]): Query {
    const query = <InsertQuery>this.#getQuery();
    query.returning(...args);
    return this;
  }

  /* Update query */
  update(): Query {
    this.#query = new UpdateQuery();
    return this;
  }

  value(row: any): Query {
    const query = <UpdateQuery>this.#getQuery();
    query.value(row);
    return this;
  }

  /* Select query */
  select(...args: any[]): Query {
    this.#query = new SelectQuery();
    this.#query.columns(...args);
    return this;
  }

  delete(): Query {
    this.#query = new DeleteQuery();
    return this;
  }

  from(nameWithSchema: string): Query {
    if (!this.#query)
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Query not initialized"
      );
    if (!nameWithSchema)
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Table name not provided"
      );

    const query = <SelectQuery | DeleteQuery>this.#query;
    query.from(nameWithSchema);
    return this;
  }

  groupBy(columnName: string): Query {
    const query = <SelectQuery>this.#getQuery();
    query.groupBy(columnName);
    return this;
  }

  where(column: string | number | boolean, operator: any, value?: any): Query {
    const query = <SelectQuery>this.#getQuery();
    query.where(column, operator, value);
    return this;
  }

  count() {
    const query = <SelectQuery>this.#getQuery();
    query.columns("COUNT(*) as count");
  }

  limit(limit: number): Query {
    const query = <SelectQuery>this.#getQuery();
    query.limit(limit);
    return this;
  }

  offset(offset: number): Query {
    const query = <SelectQuery>this.#getQuery();
    query.offset(offset);
    return this;
  }

  orderBy(columnNameOrOrderList?: string | OrderByType[],
          direction?: OrderByDirectionType): Query {
    const query = <SelectQuery>this.#getQuery();
    query.orderBy(columnNameOrOrderList, direction);
    return this;
  }

  getSQLQuery(): string {
    const query = this.#getQuery();
    return query.buildQuery();
  }

  async execute(): Promise<any> {
    const sqlQuery = this.getSQLQuery();
    const reserve = await this.#sql.reserve();
    let result;
    try {
      result = await reserve.unsafe(sqlQuery);
    } catch (_err) {
      await reserve.release();
      throw _err;
    }
    await reserve.release();
    return result;
  }

  async cursor(): Promise<any[]> {
    if (this.getType() !== "select")
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Query type not supported"
      );
    const sqlQuery = this.getSQLQuery();
    const reserve = await this.#sql.reserve();
    const cursor = await reserve.unsafe(sqlQuery).cursor();
    await reserve.release();
    return cursor;
  }

  #getQuery():
    | SelectQuery
    | DeleteQuery
    | CreateQuery
    | InsertQuery
    | UpdateQuery
    | AlterQuery {
    if (!this.#query)
      throw new ORMError(
        DatabaseErrorCode.GENERIC_ERROR,
        "Query not initialized"
      );
    return this.#query;
  }
}
