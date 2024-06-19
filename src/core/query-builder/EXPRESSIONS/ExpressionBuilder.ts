import CompoundExpression from "./CompoundExpression.ts";
import SimpleExpression from "./SimpleExpression.ts";
import { TWhereClauseOperator, TPreparedStatement } from "../../types.ts";

export default class ExpressionBuilder {
  #expression?: CompoundExpression;

  constructor() {}

  getCompoundExpression() {
    return this.#expression;
  }

  where(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operatorOrValue?: TWhereClauseOperator | any,
    value?: any,
  ) {
    this.#expression = new CompoundExpression();
    if (typeof columnOrCompoundFunction === "string") {
      this.#expression.addExpression(
        new SimpleExpression(columnOrCompoundFunction, operatorOrValue, value),
      );
    } else if (typeof columnOrCompoundFunction === "function") {
      const where = new ExpressionBuilder();
      columnOrCompoundFunction(where);
      const compoundExpression = where.getCompoundExpression();
      if (compoundExpression) {
        this.#expression.addExpression(compoundExpression);
      } else {
        console.log("Ignoring empty expression");
      }
    }
    return this;
  }

  andWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operator?: any,
    value?: any,
  ) {
    if (!this.#expression) this.#expression = new CompoundExpression();
    if (typeof columnOrCompoundFunction === "string") {
      this.#expression.addExpression(
        new SimpleExpression(columnOrCompoundFunction, operator, value),
        "AND",
      );
    } else if (typeof columnOrCompoundFunction === "function") {
      const where = new ExpressionBuilder();
      columnOrCompoundFunction(where);
      const compoundExpression = where.getCompoundExpression();
      if (compoundExpression) {
        this.#expression.addExpression(compoundExpression, "AND");
      } else {
        console.log("Ignoring empty expression");
      }
    }
    return this;
  }

  orWhere(
    columnOrCompoundFunction:
      | string
      | number
      | boolean
      | ((where: ExpressionBuilder) => void),
    operator?: any,
    value?: any,
  ) {
    if (!this.#expression) this.#expression = new CompoundExpression();
    if (typeof columnOrCompoundFunction === "string") {
      this.#expression.addExpression(
        new SimpleExpression(columnOrCompoundFunction, operator, value),
        "OR",
      );
    } else if (typeof columnOrCompoundFunction === "function") {
      const where = new ExpressionBuilder();
      columnOrCompoundFunction(where);
      const compoundExpression = where.getCompoundExpression();
      if (compoundExpression) {
        this.#expression.addExpression(compoundExpression, "OR");
      } else {
        console.log("Ignoring empty expression");
      }
    }
    return this;
  }

  toJSON() {
    return this.#expression?.toJSON();
  }

  prepareStatement(): TPreparedStatement {
    if (!this.#expression) {
      return {
        sql: "",
        values: [],
      };
    }
    return this.#expression.prepareStatement();
  }
}
