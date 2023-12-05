import * as uuid from "https://deno.land/std@0.208.0/uuid/mod.ts";

type UUID = string;

export class UUIDUtils {
  static generateId(): UUID {
    return crypto.randomUUID();
  }

  static isValidId(id: UUID): boolean {
    return uuid.validate(id);
  }
}

export type { UUID };