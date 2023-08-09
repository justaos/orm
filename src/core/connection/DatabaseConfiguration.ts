export type DatabaseConfigurationOptions = {
  host: string;
  port: number;
  database: string;
  dialect?: string;
  username?: string;
  password?: string;
  connectTimeoutMS?: number;
};
export class DatabaseConfiguration {
  readonly #host: string;
  readonly #port: number;
  readonly #dialect: string;
  readonly #database: string;
  readonly #username?: string;
  readonly #password?: string;
  readonly #connectTimeoutMS?: number;

  constructor({
    host,
    port,
    dialect,
    database,
    username,
    password,
    connectTimeoutMS
  }: DatabaseConfigurationOptions) {
    this.#host = host || "127.0.0.1";
    this.#port = port || 27017;
    this.#dialect = dialect || "mongodb";
    this.#database = database;
    this.#username = username;
    this.#password = password;
    this.#connectTimeoutMS = connectTimeoutMS;
  }

  getUri(): string {
    let uri: string;
    if (this.#username && this.#password) {
      uri = `${this.#dialect}://${this.#username}:${this.#password}@${
        this.#host
      }:${this.#port}`;
    } else {
      uri = `${this.#dialect}://${this.#host}:${this.#port}`;
    }
    if (this.#database) uri = `${uri}/${this.#database}`;
    if (this.#connectTimeoutMS) {
      return `${uri}?connectTimeoutMS=${this.#connectTimeoutMS}`;
    }
    return uri;
  }
}
