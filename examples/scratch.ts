import PostgresQueryBuilder from "../src/core/query-builder/PostgresQueryBuilder.ts";
import ExpressionBuilder from "../src/core/query-builder/EXPRESSIONS/ExpressionBuilder.ts";
import { WHERE_CLAUSE_OPERATORS } from "../src/core/types.ts";

console.log(
  PostgresQueryBuilder.select("count(*)")
    .from("table1", "table2")
    .where("column1", "=", "value1")
    .andWhere((builder: ExpressionBuilder) =>
      builder
        .where("column2", "=", "value2")
        .andWhere("column3", "=", "value3")
        .andWhere("column4", "!=", undefined),
    )
    .orWhere("column3", "IS NULL")
    .orWhere("column4", "IS true")
    .limit(10)
    .offset(5)
    .groupBy("column1")
    .buildQuery(),
);
