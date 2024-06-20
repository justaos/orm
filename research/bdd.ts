import { describe, type it } from "https://deno.land/x/test_suite@0.16.1/mod.ts";
import type { assertEquals } from "https://deno.land/std@0.135.0/testing/asserts.ts";
import {
  type getUser,
  resetUsers,
  User,
} from "https://deno.land/x/test_suite@0.16.1/examples/user.ts";

interface UserContext {
  user: User;
}

export const userSuite = describe({
  name: "user",
  beforeEach(this: UserContext) {
    this.user = new User("Kyle June");
  },
  afterEach() {
    resetUsers();
  },
});
