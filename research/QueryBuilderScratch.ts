import PostgresQueryBuilder from "../src/core/query-builder/PostgresQueryBuilder.ts";
import WhereClause from "../src/core/query-builder/CLAUSES/WhereClause.ts";

console.log(
  PostgresQueryBuilder.select("count(*)")
    .from("table1", "table2")
    .where("column1", "=", "value1")
    .andWhere((builder: WhereClause) =>
      builder
        .where("column2", "=", "value2")
        .andWhere("column3", "=", "value3")
        .andWhere("column4", "!=", undefined)
    )
    .orWhere("column3", null)
    .orWhere("column4", "IS true")
    .limit(10)
    .offset(5)
    .groupBy("column1")
    .buildQuery(),
);

console.log(
  PostgresQueryBuilder.update()
    .into("teacher")
    .where("age", "=", "10")
    .orWhere("age", "=", "20")
    .set("name", "John Doe")
    .set("badge_number", 123)
    .returning("name", "badge_number")
    .buildQuery(),
);
