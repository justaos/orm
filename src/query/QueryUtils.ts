import { JSONArray, JSONObject, JSONPrimitive } from "../types.ts";
import { SqlString } from "../../deps.ts";

export default class QueryUtils {
  static escapeValue(
    value: JSONPrimitive | JSONArray | JSONObject | object,
  ): string {
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (typeof value === "string" || value === null) {
      return SqlString.literal(value);
    }
    if (typeof value === "object") {
      return `'${JSON.stringify(value)}'`;
    }
    return String(value);
  }
}
