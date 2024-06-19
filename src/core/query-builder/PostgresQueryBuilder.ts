import SelectQuery from "./DQL/SelectQuery.ts";

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

  static insert(): void {
    throw new Error("Method not implemented.");
  }

  static update(): void {
    throw new Error("Method not implemented.");
  }

  static delete(): void {
    throw new Error("Method not implemented.");
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
