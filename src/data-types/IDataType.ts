import type { TColumnDataType, TColumnDefinitionStrict } from "../types.ts";
import type { JSONValue } from "../../deps.ts";

abstract class IDataType {
  readonly #name: string;

  protected constructor(name: string) {
    this.#name = name;
  }

  getName(): string {
    return this.#name;
  }

  abstract getNativeType(definition: TColumnDefinitionStrict): TColumnDataType;

  /**
   * Validate the column definition
   * @param definition
   * @throws {Error} if the definition is invalid
   */
  abstract validateDefinition(definition: TColumnDefinitionStrict): void;

  abstract toJSONValue(value: unknown): JSONValue;

  abstract setValueIntercept(value: unknown): any;

  abstract validateValue(value: unknown): Promise<void>;
}

export default IDataType;
