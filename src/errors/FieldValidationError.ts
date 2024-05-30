import { ColumnDefinition } from "../types.ts";
import { JSONValue } from "../../deps.ts";

type FieldValidationErrorObject = {
  code: string;
  columnDefinition: ColumnDefinition;
  value: JSONValue;
};

export type { FieldValidationErrorObject };

export class FieldValidationError extends Error {
  readonly #code: string;

  readonly #columnDefinition: ColumnDefinition;

  readonly #value: JSONValue;

  constructor(fieldDefinition: ColumnDefinition, value: any, code: string) {
    super(`FieldValidationError: ${fieldDefinition} ${value} ${code}`);
    this.name = "FieldValidationError";
    this.#columnDefinition = fieldDefinition;
    this.#value = value;
    this.#code = code;
    Object.setPrototypeOf(this, FieldValidationError.prototype);
  }

  toJSON(): FieldValidationErrorObject {
    return {
      code: this.#code,
      columnDefinition: this.#columnDefinition,
      value: this.#value,
    };
  }
}
