import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

import { CommonUtils, type UUID } from "@justaos/utils/common-utils";

import { Logger, LoggerUtils } from "@justaos/utils/logger-utils";

import { default as SqlString } from "npm:pg-escape";

export { postgres, LoggerUtils, Logger, CommonUtils, SqlString };

export type { UUID };
