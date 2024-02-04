import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";

import { Logger, LoggerUtils } from "https://deno.land/x/justaos_utils@v1.9.0/packages/logger-utils/mod.ts";
import { CommonUtils, UUID } from "https://deno.land/x/justaos_utils@v1.9.0/packages/common-utils/mod.ts";
import DateUtils from "https://deno.land/x/justaos_utils@v1.9.0/packages/date-utils/mod.ts";
import { default as SqlString } from "npm:pg-escape";


export { postgres, LoggerUtils, Logger, CommonUtils, DateUtils, SqlString };

export type { UUID };
