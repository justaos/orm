import {
  describe,
  it,
} from "https://deno.land/x/test_suite@0.16.1/describe.ts";
import {
  getUser,
  resetUsers,
  User,
} from "https://deno.land/x/test_suite@0.16.1/examples/user.ts";
import { assertEquals } from "https://deno.land/std@0.135.0/testing/asserts.ts";

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

it(userSuite, "create", () => {
  const user = new User("John Doe");
  assertEquals(user.name, "John Doe");
});

const getUserSuite = describe({
  name: "getUser",
  suite: userSuite,
});

it(getUserSuite, "user does not exist", () => {
  assertEquals(getUser("John Doe"), undefined);
});

it(getUserSuite, "user exists", function (this: UserContext) {
  assertEquals(getUser("Kyle June"), this.user);
});

it(userSuite, "resetUsers", function (this: UserContext) {
  assertEquals(getUser("Kyle June"), this.user);
  resetUsers();
  assertEquals(getUser("Kyle June"), undefined);
});
