import { UUID } from "./types.ts";
import { uuid } from "../deps.ts";

export class UUIDUtils {
  static generateId(): UUID {
    return crypto.randomUUID();
  }

  static isValidId(id: UUID): boolean {
    return uuid.validate(id);
  }
}
