import { QueryExpression } from "./QueryExpression.ts";
import type { JSONPrimitive } from "../../deps.ts";
import QueryUtils from "./QueryUtils.ts";
import { ORMError } from "../errors/ORMError.ts";

export default class WhereClause {
  #where?: QueryExpression;

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
      return `"${condition.condition.column}" ${condition.condition.operator} (${
        condition.condition.value
          .map((value: JSONPrimitive) => {
            return QueryUtils.escapeValue(value);
          })
          .join(", ")
      })`;
    }
    return `"${condition.condition.column}" ${condition.condition.operator} ${
      QueryUtils.escapeValue(condition.condition.value)
    }`;
  }

  #prepareExpressionCondition(condition: QueryExpression): string {
    if (condition.expressions.length) {
      return condition.expressions
        .map((condition: any) => {
          const expressCondition: QueryExpression = <QueryExpression> condition;
          if (expressCondition.type == "COMPOUND") {
            return this.#prepareExpressionCondition(expressCondition);
          } else {
            return this.#prepareSimpleCondition(<QueryExpression> condition);
          }
        })
        .join(` ${condition.compoundOperator} `);
    }
    return "";
  }
}
