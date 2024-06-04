import { ORMError } from "./ORMError.ts";

export class ORMGeneralError extends ORMError {
  constructor(message: string) {
    super("GENERAL", message);
  }
}
