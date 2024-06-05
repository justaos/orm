import type { JSONArray, JSONObject, JSONPrimitive } from "../../deps.ts";

export default class QueryUtils {
  static escapeValue(
    value: JSONPrimitive | JSONArray | JSONObject | object,
  ): string {
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (typeof value === "string" || value === null) {
      return literal(value);
    }
    if (typeof value === "object") {
      return `'${JSON.stringify(value)}'`;
    }
    return String(value);
  }
}

const literal: any = function (val: any): string {
  if (null == val) return "NULL";
  if (Array.isArray(val)) {
    const vals = val.map(literal);
    return "(" + vals.join(", ") + ")";
  }
  const backslash = ~val.indexOf("\\");
  const prefix = backslash ? "E" : "";
  val = val.replace(/'/g, "''");
  val = val.replace(/\\/g, "\\\\");
  return prefix + "'" + val + "'";
};
