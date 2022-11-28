import { assert } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { afterAll, beforeAll, describe, it } from 'https://deno.land/std@0.166.0/testing/bdd.ts';
import {Session} from "./test.utils.ts";

describe('End test cleanup', () => {

    it("disconnect check", async () => {
        if (Session.hasODM())
            Session.getODM().closeConnection();
        assert( true, 'close connection success');
    });

});
