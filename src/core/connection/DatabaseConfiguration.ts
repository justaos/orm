export default class DatabaseConfiguration {
   readonly #host: string;
   readonly #port: number;
   readonly #database: string;
   readonly #username: string;
   readonly #password: string;
   readonly #dialect: string;
   readonly #connectTimeoutMS: number | undefined;

  constructor(
    host = "127.0.0.1",
    port = 27017,
    dialect = "mongodb",
    database?: string,
    username?: string,
    password?: string,
    connectTimeoutMS?: number,
  ) {
    this.#host = host;
    this.#port = port;
    this.#database = database || "";
    this.#username = username || "";
    this.#password = password || "";
    this.#dialect = dialect;
    this.#connectTimeoutMS = connectTimeoutMS;
  }

  getUri(): string {
    let uri = this.getUriWithoutDatabase();
    if (this.#database) uri = `${uri}/${this.#database}`;
    if (this.#connectTimeoutMS) {
      return `${uri}?connectTimeoutMS=${this.#connectTimeoutMS}`;
    }
    return uri;
  }

  getUriWithoutDatabase(): string {
    if (this.#username && this.#password) {
      return `${this.#dialect}://${this.#username}:${this.#password}@${this.#host}:${this.#port}`;
    }
    return `${this.#dialect}://${this.#host}:${this.#port}`;
  }

  getDatabaseName(): string {
    return this.#database;
  }
}
