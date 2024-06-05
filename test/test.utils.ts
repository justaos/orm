import { LoggerUtils } from "../deps.ts";
import { ORM } from "../mod.ts";
import type ORMConnection from "../src/ORMConnection.ts";

class Session {
  static #odm: ORM;

  static #odmConnection: ORMConnection;

  static setORM(odm: ORM) {
    Session.#odm = odm;
  }

  static getORM(): ORM {
    return Session.#odm;
  }

  static async getConnection(
    forceNewConnection: boolean = false,
  ): Promise<ORMConnection> {
    if (!this.#odm) {
      this.#odm = new ORM(
        {
          hostname: Deno.env.get("POSTGRES_HOST") || "127.0.0.1",
          port: 5432,
          username: "postgres",
          password: "postgres",
          database: "odm-test-db",
        },
        logger,
      );
    }

    if (forceNewConnection || !this.#odmConnection) {
      this.#odmConnection = await this.#odm.connect(true);
    }
    return this.#odmConnection;
  }

  static getLogger() {
    return logger;
  }
}

const MAX_TIMEOUT = 10000;
const logger = LoggerUtils.defineLogger("ORMTest", "DEBUG");

export { logger, MAX_TIMEOUT, Session };
