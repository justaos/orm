import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

import { CommonUtils, type UUID } from "@justaos/utils/common-utils";

import { Logger, LoggerUtils } from "@justaos/utils/logger-utils";

import { default as SqlString } from "pg-escape";

export { CommonUtils, Logger, LoggerUtils, postgres, SqlString };

export type { UUID };
