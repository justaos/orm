import { TLogicalOperator } from "../core/types.ts";
import { QueryExpression } from "./QueryExpression.ts";

export class CompoundQuery {
  compoundOperator: TLogicalOperator;
  queryExpression: QueryExpression;
  #currentExpression?: QueryExpression;

  constructor(
    compoundOperator: TLogicalOperator,
    queryExpression: QueryExpression,
  ) {
    this.compoundOperator = compoundOperator;
    this.queryExpression = queryExpression;
  }

  compoundOr(): CompoundQuery {
    return new CompoundQuery("OR", <QueryExpression>this.#currentExpression);
  }

  compoundAnd(): CompoundQuery {
    return new CompoundQuery("AND", <QueryExpression>this.#currentExpression);
  }

  where(
    column: string | number | boolean,
    operator: any,
    value?: any,
  ): CompoundQuery {
    if (this.compoundOperator === "OR") {
      this.#currentExpression = this.queryExpression.orWhere(
        column,
        operator,
        value,
      );
    } else if (this.compoundOperator === "AND") {
      this.#currentExpression = this.queryExpression.andWhere(
        column,
        operator,
        value,
      );
    }

    return this;
  }
}
