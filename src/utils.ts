import type { Logger } from "../deps.ts";
import * as minify from "npm:pg-minify@1.6.4";
import type { DatabaseClient } from "./core/connection/DatabaseClient.ts";

export function logSQLQuery(logger: Logger, query: string): void {
  try {
    if (logger.levelName === "DEBUG") logger.debug(minify.default(query));
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function runSQLQuery(
  client: DatabaseClient,
  query: string,
): Promise<any> {
  const { rows }: any = await client.executeQuery(query);
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

/**
 * Returns the short form of the table name.
 * @param name
 * @returns {string}
 *
 * @example
 * getShortFormTableName("public.table") // table
 */
export function getShortFormTableName(name: string): string {
  const parts = name.split(".");
  if (parts.length == 2 && parts[0] === "public") {
    return parts[1];
  }
  return name;
}

/**
 * Returns the table name without schema.
 * @param name
 * @returns {string}
 *
 * @example
 * getTableNameWithoutSchema("public.table") // table
 */
export function getTableNameWithoutSchema(name: string): string {
  const parts = name.split(".");
  if (parts.length == 2) {
    return parts[1];
  }
  return name;
}

export const isEqualArray = (a: string[], b: string[]) =>
  JSON.stringify(a.sort()) === JSON.stringify(b.sort());
