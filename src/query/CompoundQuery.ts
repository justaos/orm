import type { SimpleCondition } from "../types.ts";
import { ORMError } from "../errors/ORMError.ts";
import { CompoundOperator } from "../types.ts";
import { QueryExpression } from "./QueryExpression.ts";

export class CompoundQuery {
  compoundOperator: CompoundOperator;
  queryExpression: QueryExpression;
  #currentExpression?: QueryExpression;

  constructor(
    compoundOperator: CompoundOperator,
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
