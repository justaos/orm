import RecordQuery from "./RecordQuery.ts";
import Table from "../Table.ts";
import { OrderByDirectionType, OrderByType } from "./OrderByType.ts";

export default class SelectQuery extends RecordQuery {
  #columns: string[] = ["*"];

  #where: any[] = [];

  #offset: number | undefined;

  #limit: number | undefined;

  #sortList: OrderByType[] = [];

  constructor(table: Table) {
    super(table);
  }

  getSelectedColumns(): string[] | undefined {
    if (this.#columns.length >= 1 && this.#columns[0] !== "*") {
      return this.#columns;
    }
  }

  columns(...args: string[]): SelectQuery {
    if (args.length === 0) {
      this.#columns = ["*"];
    } else if (args.length === 1 && Array.isArray(args[0])) {
      this.#columns = args[0];
    } else if (args.length === 1 && typeof args[0] === "object") {
      this.#columns = Object.keys(args[0]);
    } else {
      this.#columns = args.map((arg) => {
        if (typeof arg === "object") {
          throw new Error("Invalid argument");
        }
        return arg;
      });
    }
    return this;
  }

  where(column: any, operator: any, value?: any): SelectQuery {
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

  limit(limit: number): SelectQuery {
    this.#limit = limit;
    return this;
  }

  offset(offset: number): SelectQuery {
    this.#offset = offset;
    return this;
  }

  /*
   * [
      { column: 'firstName', order: 'ASC' },
      { column: 'lastName', order: 'DESC' }
    ]
   */
  orderBy(
    columnNameOrOrderList?: string | OrderByType[],
    direction?: OrderByDirectionType
  ): SelectQuery {
    if (typeof columnNameOrOrderList === "undefined") {
      return this;
    }
    if (typeof columnNameOrOrderList === "string") {
      this.#sortList.push({
        column: columnNameOrOrderList,
        order: direction || "ASC"
      });
      return this;
    }
    if (Array.isArray(columnNameOrOrderList)) {
      this.#sortList.push(...columnNameOrOrderList);
      return this;
    }
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

  #prepareLimitClause(): string {
    if (typeof this.#limit === "undefined") {
      return "";
    }
    return ` LIMIT ${this.#limit}`;
  }

  #prepareOffsetClause(): string {
    if (typeof this.#offset === "undefined") {
      return "";
    }
    return ` OFFSET ${this.#offset}`;
  }

  #prepareOrderByClause(): string {
    if (this.#sortList.length === 0) {
      return "";
    }
    return (
      " ORDER BY " +
      this.#sortList
        .map((sort) => {
          return `"${sort.column}" ${sort.order}`;
        })
        .join(", ")
    );
  }

  buildSelectQuery(): string {
    const schemaName = this.getTable().getSchemaName();
    const tableName = this.getTable().getName();

    let query = `SELECT ${this.#columns} FROM ${schemaName}.${tableName}`;
    query = query + this.#prepareWhereClause();
    query = query + this.#prepareOrderByClause();
    query = query + this.#prepareLimitClause();
    query = query + this.#prepareOffsetClause();

    return query;
  }

  buildCountQuery(): string {
    const schemaName = this.getTable().getSchemaName();
    const tableName = this.getTable().getName();

    let query = `SELECT COUNT(*) as count FROM ${schemaName}.${tableName}`;
    query = query + this.#prepareWhereClause();
    query = query + this.#prepareLimitClause();
    query = query + this.#prepareOffsetClause();

    return query;
  }
}
