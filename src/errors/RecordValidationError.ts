import {
  FieldValidationError,
  FieldValidationErrorObject
} from "./FieldValidationError.ts";
import { TableDefinition } from "../table/definitions/TableDefinition.ts";

type RecordValidationErrorObject = {
  tableDefinition: TableDefinition;
  recordId: string | undefined;
  fieldErrors: FieldValidationErrorObject[];
};

export type { RecordValidationErrorObject };

export class RecordValidationError extends Error {
  readonly #tableDefinition: TableDefinition;

  readonly #recordId: string | undefined;

  readonly #fieldErrors: FieldValidationError[] = [];

  constructor(
    tableDefinition: TableDefinition,
    recordId: string | undefined,
    fieldErrors: FieldValidationError[],
    message?: string
  ) {
    super(
      `Record validation error in collection ${tableDefinition.name} with id ${recordId}. ${message}`
    );
    this.name = "RecordValidationError";
    this.#tableDefinition = tableDefinition;
    this.#recordId = recordId;
    this.#fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, RecordValidationError.prototype);
  }

  toJSON(): RecordValidationErrorObject {
    return {
      tableDefinition: this.#tableDefinition,
      recordId: this.#recordId,
      fieldErrors: this.#fieldErrors.map((fieldError: FieldValidationError) => {
        return fieldError.toJSON();
      })
    };
  }
}
