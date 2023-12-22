import { format } from "npm:sql-formatter";
import { Logger } from "../deps.ts";

export function logSQLQuery(logger: Logger, query: string) {
  return logger.debug("\n" + format(query));
}