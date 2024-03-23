import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";

import {
  CommonUtils,
  DateUtils,
  Logger,
  LoggerUtils,
  type UUID,
} from "@justaos/utils";
import { default as SqlString } from "npm:pg-escape";

export { postgres, LoggerUtils, Logger, CommonUtils, DateUtils, SqlString };

export type { UUID };
