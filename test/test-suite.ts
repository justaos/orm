import { describe } from "../test_deps.ts";
import { ORM, TDatabaseConfiguration } from "../mod.ts";
import { defaultConfig } from "./test.utils.ts";

export interface TestContext {
  orm: ORM;
}

export const ormSuite = describe({
  name: "user",
  async beforeEach(this: TestContext) {
    this.orm = new ORM({
      ...defaultConfig,
    });
  },
  afterEach() {},
});
