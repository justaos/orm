import { OrderByDirectionType, OrderByType } from "../table/query/OrderByType.ts";
import TableNameUtils from "../table/TableNameUtils.ts";


type SimpleCondition = {
  column: string;
  operator: string;
  value: any;
}

type ExpressionCondition =
    {
  type: "or" | "and";
  expression: (ExpressionCondition | SimpleCondition)[]
}


export default class SelectQuery {
  #columns: string[] = ["*"];

  #where: any[] = [];

  #offset: number | undefined;

  #limit: number | undefined;

  #sortList: OrderByType[] = [];

  #from?: string;

  constructor() {
  }

  from(tableName: string): SelectQuery {
    this.#from = TableNameUtils.getFullFormTableName(tableName);
    return this;
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

  where(
    column: string | number | boolean,
    operator: any,
    value?: any
  ): SelectQuery {
    // Support "where true || where false"
    if (column === false || column === true) {
      return this.where(1, "=", column ? 1 : 0);
    }
    if (typeof value === "undefined") {
      if (Array.isArray(operator)) {
        return this.where(column, "in", operator);
      }
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

  count(): SelectQuery {
    this.#columns = ["COUNT(*) as count"];
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

  buildQuery(): string {
    let query = `SELECT ${this.#columns} FROM ${this.#from}`;
    query = query + this.#prepareWhereClause();
    query = query + this.#prepareOrderByClause();
    query = query + this.#prepareLimitClause();
    query = query + this.#prepareOffsetClause();

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
          if (Array.isArray(where.value)) {
            return `"${where.column}" ${where.operator} (${where.value
              .map((value: string) => {
                return `'${value}'`;
              })
              .join(", ")})`;
          }
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
}
