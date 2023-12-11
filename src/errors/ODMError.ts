export enum DatabaseErrorCode {
  GENERIC_ERROR = "GENERIC_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR"
}

export class ODMError extends Error {
  public readonly name: string;
  public readonly code: DatabaseErrorCode;

  constructor(code: DatabaseErrorCode, description: string) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "ODMError";
    this.code = code;

    Error.captureStackTrace(this);
  }
}
