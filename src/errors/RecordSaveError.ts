import {
  FieldValidationError,
  FieldValidationErrorObject,
} from "./FieldValidationError.ts";
import { TableDefinitionInternal } from "../types.ts";

type RecordValidationErrorObject = {
  tableDefinition: TableDefinitionInternal;
  recordId: string | undefined;
  fieldErrors: FieldValidationErrorObject[];
};

export type { RecordValidationErrorObject };

export class RecordSaveError extends Error {
  readonly #tableDefinition: TableDefinitionInternal;

  readonly #recordId: string | undefined;

  readonly #fieldErrors: FieldValidationError[] = [];

  constructor(
    tableDefinition: TableDefinitionInternal,
    recordId: string | undefined,
    fieldErrors: FieldValidationError[],
    message?: string,
  ) {
    super(
      `Record validation error in table ${tableDefinition.name} with id ${recordId}. ${
        message || JSON.stringify(fieldErrors)
      }`,
    );
    this.name = "RecordValidationError";
    this.#tableDefinition = tableDefinition;
    this.#recordId = recordId;
    this.#fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, RecordSaveError.prototype);
  }

  toJSON(): RecordValidationErrorObject {
    return {
      tableDefinition: this.#tableDefinition,
      recordId: this.#recordId,
      fieldErrors: this.#fieldErrors.map((fieldError: FieldValidationError) => {
        return fieldError.toJSON();
      }),
    };
  }
}
