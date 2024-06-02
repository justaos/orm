import { Logger } from "../deps.ts";

export function logSQLQuery(logger: Logger, query: string) {
  return logger.debug("\n" + query);
}

export async function runSQLQuery(conn: any, query: string) {
  const { rows }: any = await conn.query({ text: query });
  return rows;
}

export function getFullFormTableName(name: string): string {
  const parts = name.split(".");
  let schemaName = "public";
  let tableName = name;
  if (parts.length == 2) {
    schemaName = parts[0];
    tableName = parts[1];
  }
  return `${schemaName}.${tableName}`;
}

export function getShortFormTableName(name: string): string {
  const parts = name.split(".");
  if (parts.length == 2 && parts[0] === "public") {
    return parts[1];
  }
  return name;
}

export function getTableNameWithoutSchema(name: string): string {
  const parts = name.split(".");
  if (parts.length == 2) {
    return parts[1];
  }
  return name;
}
