import { OrderByDirectionType, OrderByType } from "../table/query/OrderByType.ts";
import TableNameUtils from "../table/TableNameUtils.ts";


type SimpleCondition = {
  column: string | number;
  operator: string;
  value: any;
}

type ExpressionCondition =
  {
    type: "OR" | "AND";
    expression: (ExpressionCondition | SimpleCondition)[]
  }


export default class SelectQuery {
  #columns: string[] = ["*"];

  #where: ExpressionCondition = { type: "AND", expression: [] };

  #offset: number | undefined;

  #limit: number | undefined;

  #sortList: OrderByType[] = [];

  #from?: string;

  #groupBy?: string[];

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

    this.#where.expression.push({
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

  #prepareSimpleCondition(condition: SimpleCondition): string  {
    if (Array.isArray(condition.value)) {
      return `"${condition.column}" ${condition.operator} (${condition.value
        .map((value: string) => {
          return `'${value}'`;
        })
        .join(", ")})`;
    }
    return `"${condition.column}" ${condition.operator} '${condition.value}'`;
  }

  #prepareExpressionCondition(condition: ExpressionCondition): string  {
    if(condition.expression.length) {
      return condition.expression.map((condition) => {
        const expressCondition: ExpressionCondition = <ExpressionCondition> condition;
        if (expressCondition.type) {
          return this.#prepareExpressionCondition(expressCondition);
        } else {
          return this.#prepareSimpleCondition(<SimpleCondition> condition);
        }
      }).join(` ${condition.type} ` );
    }
    return '';
  }

  #prepareWhereClause(): string {
    if (this.#where.expression.length === 0) {
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
