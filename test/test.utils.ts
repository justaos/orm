import { Logger } from '../deps.ts';
import { ODM } from '../mod.ts';

class Session {
  static #odm: undefined | ODM;

  static getODM() {
    if (!this.#odm) throw new Error('ODM is not initialized');
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
      await this.#odm.connect({
        host: '127.0.0.1',
        port: '27017',
        database: 'odm-test-db',
        dialect: 'mongodb'
      });
    }
    return this.#odm;
  }
}

const MAX_TIMEOUT = 10000;
const logger = Logger.createLogger({
  label: 'test',
  filePath:  './test/test.log'
});

export { Session, MAX_TIMEOUT, logger };
