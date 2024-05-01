import { Logger } from "../deps.ts";

export function logSQLQuery(logger: Logger, query: string) {
  return logger.debug("\n" + query);
}

export async function runSQLQuery(conn: any, query: string) {
  const { rows }: any = await conn.queryObject({ text: query });
  return rows;
}
