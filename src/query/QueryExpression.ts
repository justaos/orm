import { SimpleCondition } from "../types.ts";

export class QueryExpression {
  type: "SIMPLE" | "COMPOUND";
  condition?: SimpleCondition;

  compoundOperator?: "OR" | "AND";

  expressions: QueryExpression[] = [];

  constructor(
    type: "SIMPLE" | "COMPOUND",
    condition?: {
      column: string | number | boolean;
      operator: any;
      value?: any;
    }
  ) {
    this.type = type;
    if (type == "SIMPLE" && condition) {
      this.condition = <SimpleCondition>(
        this.#buildSimpleCondition(
          condition.column,
          condition.operator,
          condition.value
        )
      );
    }
  }

  orWhere(column: string | number | boolean, operator: any, value?: any) {
    if (!this.compoundOperator) this.compoundOperator = "OR";

    if (this.compoundOperator === "AND")
      throw new Error("Cannot use 'OR' on top of 'AND'");

    if (this.type == "SIMPLE") {
      this.type = "COMPOUND";
      if (!this.condition)
        throw new Error("condition should be present on simple");
      const expression = new QueryExpression("SIMPLE", <any>this.condition);
      this.expressions.push(expression);
      this.condition = undefined;
    }

    const expression = new QueryExpression("SIMPLE", {
      column,
      operator,
      value,
    });
    this.expressions.push(expression);
    return expression;
  }

  andWhere(column: string | number | boolean, operator: any, value?: any) {
    if (!this.compoundOperator) this.compoundOperator = "AND";

    if (this.compoundOperator === "OR")
      throw new Error("Cannot use 'AND' on top of 'OR'");

    if (this.type == "SIMPLE") {
      this.type = "COMPOUND";
      if (!this.condition)
        throw new Error("condition should be present on simple");
      const expression = new QueryExpression("SIMPLE", this.condition);
      this.expressions.push(expression);
      this.condition = undefined;
    }

    const expression = new QueryExpression("SIMPLE", {
      column,
      operator,
      value,
    });
    this.expressions.push(expression);
    return expression;
  }

  #buildSimpleCondition(
    column: string | number | boolean,
    operator: any,
    value?: any
  ): {
    column: string | number;
    operator: string;
    value: any;
  } {
    // Support "where true || where false"
    if (column === false || column === true) {
      return this.#buildSimpleCondition(1, "=", column ? 1 : 0);
    }
    if (typeof value === "undefined") {
      if (Array.isArray(operator)) {
        return this.#buildSimpleCondition(column, "in", operator);
      }
      return this.#buildSimpleCondition(column, "=", operator);
    }

    return {
      column,
      operator,
      value,
    };
  }
}
