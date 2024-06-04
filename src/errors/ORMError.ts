export type ORMErrorCode =
  | "GENERAL"
  | "DATABASE_DOES_NOT_EXISTS"
  | "QUERY"
  | "TABLE_DEFINITION_VALIDATION";

export class ORMError extends Error {
  public readonly name: string;
  public readonly code: ORMErrorCode;
  public readonly cause?: any;

  constructor(code: ORMErrorCode, message: string, cause?: any) {
    super(message);
    this.name = "ORMError";
    this.code = code;
    this.cause = cause;
  }
}
