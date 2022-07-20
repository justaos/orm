import { assertEquals, assert } from 'https://deno.land/std@0.107.0/testing/asserts.ts';
import {
    describe,
    it
} from 'https://deno.land/x/test_suite@v0.8.0/mod.ts';
import {Session} from "./test.utils.ts";

describe('End test cleanup', () => {

    it("disconnect check", async () => {
        if (Session.hasODM())
            Session.getODM().closeConnection();
        assert( true, 'close connection success');
    });

});
