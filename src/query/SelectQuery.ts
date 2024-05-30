import {
  OrderByDirectionType,
  OrderByType,
} from "../table/query/OrderByType.ts";
import TableNameUtils from "../table/TableNameUtils.ts";
import { QueryExpression } from "./QueryExpression.ts";
import QueryUtils from "./QueryUtils.ts";

export default class SelectQuery {
  #columns: string[] = ["*"];

  #where?: QueryExpression;

  #sortList: OrderByType[] = [];

  #offset?: number;

  #limit?: number;

  #from?: string;

  #groupBy?: string[];

  constructor() {}

  getColumns(): string[] {
    return this.#columns;
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
    value?: any,
  ): QueryExpression {
    if (!this.#where) {
      this.#where = new QueryExpression("COMPOUND");
    }
    return this.#where.andWhere(column, operator, value);
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
    direction?: OrderByDirectionType,
  ): SelectQuery {
    if (typeof columnNameOrOrderList === "undefined") {
      return this;
    }
    if (typeof columnNameOrOrderList === "string") {
      this.#sortList.push({
        column: columnNameOrOrderList,
        order: direction || "ASC",
      });
      return this;
    }
    if (Array.isArray(columnNameOrOrderList)) {
      this.#sortList.push(...columnNameOrOrderList);
      return this;
    }
    return this;
  }

  groupBy(...args: string[]): SelectQuery {
    if (args.length === 1 && Array.isArray(args[0])) {
      this.#groupBy = args[0];
    } else if (args.length === 1 && typeof args[0] === "object") {
      this.#groupBy = Object.keys(args[0]);
    } else {
      this.#groupBy = args.map((arg) => {
        if (typeof arg === "object") {
          throw new Error("Invalid argument");
        }
        return arg;
      });
    }
    return this;
  }

  buildQuery(): string {
    let query = `SELECT ${this.#columns}
                 FROM ${this.#from}`;
    query = query + this.#prepareWhereClause();
    query = query + this.#prepareGroupByClause();
    query = query + this.#prepareOrderByClause();
    query = query + this.#prepareLimitClause();
    query = query + this.#prepareOffsetClause();

    return query;
  }

  buildCountQuery(): string {
    let query = `SELECT COUNT(*) as count
                 FROM (SELECT * FROM ${this.#from}`;
    query = query + this.#prepareWhereClause();
    query = query + this.#prepareGroupByClause();
    query = query + this.#prepareLimitClause();
    query = query + this.#prepareOffsetClause();
    query = query + ") as t";
    return query;
  }

  #prepareSimpleCondition(condition: QueryExpression): string {
    if (!condition.condition) {
      throw new Error("Condition not defined for simple expression");
    }
    if (Array.isArray(condition.condition.value)) {
      return `"${condition.condition.column}" ${
        condition.condition.operator
      } (${condition.condition.value
        .map((value: string | null) => {
          return QueryUtils.escapeValue(value);
        })
        .join(", ")})`;
    }
    return `"${condition.condition.column}" ${condition.condition.operator} '${condition.condition.value}'`;
  }

  #prepareExpressionCondition(condition: QueryExpression): string {
    if (condition.expressions.length) {
      return condition.expressions
        .map((condition: any) => {
          const expressCondition: QueryExpression = <QueryExpression>condition;
          if (expressCondition.type == "COMPOUND") {
            return this.#prepareExpressionCondition(expressCondition);
          } else {
            return this.#prepareSimpleCondition(<QueryExpression>condition);
          }
        })
        .join(` ${condition.compoundOperator} `);
    }
    return "";
  }

  #prepareWhereClause(): string {
    if (!this.#where || !this.#where.expressions.length) {
      return "";
    }
    return (
      " WHERE " + this.#prepareExpressionCondition(this.#where)
      /*this.#where
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
        .join(" AND ")*/
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

  #prepareGroupByClause(): string {
    if (typeof this.#groupBy === "undefined") {
      return "";
    }
    return (
      " GROUP BY " +
      this.#groupBy
        .map((group) => {
          return `"${group}"`;
        })
        .join(", ")
    );
  }
}
