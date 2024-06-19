import IClause from "./IClause.ts";

export default class LimitClause implements IClause {
  #limit: number;

  constructor(limit: number) {
    if (isNaN(limit) || limit < 0) {
      throw new Error(
        `Invalid Limit provided in LimitClause. Limit must be a number greater than 0.`,
      );
    }
    this.#limit = limit;
  }

  toJSON(): any {
    return {
      limit: this.#limit,
    };
  }

  prepareStatement(): { sql: string; values: any[] } {
    return {
      sql: ` LIMIT ${this.#limit}`,
      values: [],
    };
  }
}
