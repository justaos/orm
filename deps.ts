import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

import { CommonUtils, type UUID } from "@justaos/utils/common-utils";
import { default as SqlString } from "pg-escape";
import pg from "pg";

export { Logger, LoggerUtils } from "@justaos/utils/logger-utils";

export { CommonUtils, postgres, SqlString };

export type { UUID };

export { pg };
