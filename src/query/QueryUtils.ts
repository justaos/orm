import { JSONArray, JSONObject, JSONPrimitive } from "../types.ts";
import { SqlString } from "../../deps.ts";

export default class QueryUtils {
  static escapeValue(
    value: JSONPrimitive | JSONArray | JSONObject | object
  ): string {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      return SqlString.escape(value);
    }
    if (typeof value === "object") {
      return `'${JSON.stringify(value)}'`;
    }
    return String(value);
  }
}