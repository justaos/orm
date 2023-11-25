import { Logger } from "../deps.ts";
import { ODM } from "../mod.ts";

class Session {
  static #odm: undefined | ODM;

  static getODM() {
    if (!this.#odm) throw new Error("ODM is not initialized");
    return this.#odm;
  }

  static hasODM() {
    return !!this.#odm;
  }

  static setODM(odm: ODM) {
    this.#odm = odm;
  }

  static async getODMByForce(): Promise<ODM> {
    if (!this.#odm) {
      this.#odm = new ODM();
      await this.#odm.connect(
        {
          hostname: "127.0.0.1",
          port: 5432,
          username: "postgres",
          password: "admin",
          database: "odm-test-db"
        },
        true
      );
    }
    return this.#odm;
  }
}

const MAX_TIMEOUT = 10000;
const logger = Logger.createLogger({
  label: "test",
  //filePath: "./test/test.log", cannot be used in github actions
});

export { logger, MAX_TIMEOUT, Session };
