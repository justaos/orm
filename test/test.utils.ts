import { Logger } from "../deps.ts";
import { ODM } from "../mod.ts";
import ODMConnection from "../src/ODMConnection.ts";

class Session {
  static #odm: ODM;

  static #odmConnection: ODMConnection;

  static async getConnection(
    forceNewConnection: boolean = false
  ): Promise<ODMConnection> {
    if (!this.#odm) {
      this.#odm = new ODM({
        hostname: "127.0.0.1",
        port: 5432,
        username: "postgres",
        password: "admin",
        database: "odm-test-db"
      });
    }

    if (forceNewConnection || !this.#odmConnection) {
      this.#odmConnection = await this.#odm.connect(true);
    }
    return this.#odmConnection;
  }
}

const MAX_TIMEOUT = 10000;
const logger = Logger.createLogger({
  label: "test"
  //filePath: "./test/test.log", cannot be used in github actions
});

export { logger, MAX_TIMEOUT, Session };
