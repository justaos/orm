import SelectQuery from "./DQL/SelectQuery.ts";
import UpdateQuery from "./DML/UpdateQuery.ts";
import InsertQuery from "./DML/InsertQuery.ts";
import DeleteQuery from "./DML/DeleteQuery.ts";

export default class PostgresQueryBuilder {
  static select(
    columnNameOrObjectOrArray?: string | string[] | { [key: string]: boolean },
    ...otherColumns: string[]
  ): SelectQuery {
    return new SelectQuery().columns(
      columnNameOrObjectOrArray,
      ...otherColumns,
    );
  }

  static insert(): InsertQuery {
    return new InsertQuery();
  }

  static update(): UpdateQuery {
    return new UpdateQuery();
  }

  static delete(): DeleteQuery {
    return new DeleteQuery();
  }

  static createTable(): void {
    throw new Error("Method not implemented.");
  }

  static dropTable(): void {
    throw new Error("Method not implemented.");
  }

  static createDatabase(): void {
    throw new Error("Method not implemented.");
  }

  static dropDatabase(): void {
    throw new Error("Method not implemented.");
  }

  static alterTable(): void {
    throw new Error("Method not implemented.");
  }
}
