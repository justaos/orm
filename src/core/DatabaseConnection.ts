import { pg, PgCursor } from "../../deps.ts";

export class DatabaseConnection {
  readonly #pgClient: pg.Client;

  constructor(client: pg.Client) {
    this.#pgClient = client;
  }

  async doesSchemaExist(schemaName: string): Promise<boolean> {
    const query = `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${schemaName}'`;
    const result = await this.runQuery(query);
    return result.rowCount > 0;
  }

  async createSchema(schemaName: string): Promise<void> {
    const query = `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`;
    await this.runQuery(query);
  }

  async runQuery(query: string): Promise<pg.QueryResult> {
    return await this.#pgClient.query({
      text: query,
    });
  }

  async createCursor(query: string): Promise<pg.Cursor> {
    return await this.#pgClient.query(new PgCursor(query));
  }

  on(event: string, callback: any) {
    this.#pgClient.on(event, callback);
  }

  release() {
    this.#pgClient.release();
  }
}
