import { QueryExpression } from "./QueryExpression.ts";
import type { JSONPrimitive } from "../../deps.ts";
import QueryUtils from "./QueryUtils.ts";
import { ORMError } from "../errors/ORMError.ts";
import { CompoundQuery } from "./CompoundQuery.ts";

export default class WhereClause {
  #where?: QueryExpression;
  #currentExpression?: QueryExpression;

  where(
    column: string | number | boolean,
    operator: any,
    value?: any,
  ): WhereClause {
    if (!this.#where) {
      this.#where = new QueryExpression("COMPOUND");
    }
    this.#currentExpression = this.#where.andWhere(column, operator, value);
    return this;
  }

  compoundOr(): CompoundQuery {
    if (!this.#currentExpression) {
      throw new ORMError("QUERY", "Cannot use 'OR' without 'WHERE'");
    }
    return new CompoundQuery("OR", <QueryExpression>this.#currentExpression);
  }

  compoundAnd(): CompoundQuery {
    if (!this.#currentExpression) {
      throw new ORMError("QUERY", "Cannot use 'AND' without 'WHERE'");
    }
    return new CompoundQuery("AND", <QueryExpression>this.#currentExpression);
  }

  prepareWhereClause(): string {
    if (!this.#where || !this.#where.expressions.length) {
      return "";
    }
    return " WHERE " + this.#prepareExpressionCondition(this.#where);
  }

  #prepareSimpleCondition(condition: QueryExpression): string {
    if (!condition.condition) {
      throw new ORMError(
        "QUERY",
        "Condition not defined for simple expression",
      );
    }
    if (Array.isArray(condition.condition.value)) {
      return `"${condition.condition.column}" ${
        condition.condition.operator
      } (${condition.condition.value
        .map((value: JSONPrimitive) => {
          return QueryUtils.escapeValue(value);
        })
        .join(", ")})`;
    }
    return `"${condition.condition.column}" ${
      condition.condition.operator
    } ${QueryUtils.escapeValue(condition.condition.value)}`;
  }

  #prepareExpressionCondition(condition: QueryExpression): string {
    if (condition.expressions.length) {
      return condition.expressions
        .map((condition: any) => {
          const expressCondition: QueryExpression = <QueryExpression>condition;
          if (expressCondition.type == "COMPOUND") {
            return `(${this.#prepareExpressionCondition(expressCondition)})`;
          } else {
            return this.#prepareSimpleCondition(<QueryExpression>condition);
          }
        })
        .join(` ${condition.compoundOperator} `);
    }
    return "";
  }
}
