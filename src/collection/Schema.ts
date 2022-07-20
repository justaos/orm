import { CommonUtils } from '../../deps.ts';

import FieldTypeRegistry from '../field-types/FieldTypeRegistry.ts';
import SchemaRegistry from './SchemaRegistry.ts';
import Field from './Field.ts';
import RecordValidationError from '../errors/RecordValidationError.ts';

export default class Schema {
  readonly #name: string;

  readonly #label: string;

  readonly #final: boolean;

  readonly #extends: string;

  readonly #definition: any;

  #fields: Field[] = [];

  #fieldTypeRegistry: FieldTypeRegistry;

  #schemaRegistry: SchemaRegistry;

  constructor(
    schemaDefinition: any,
    fieldTypeRegistry: FieldTypeRegistry,
    schemaRegistry: SchemaRegistry
  ) {
    this.#fieldTypeRegistry = fieldTypeRegistry;
    this.#schemaRegistry = schemaRegistry;
    this.#name = schemaDefinition.name;
    this.#label = schemaDefinition.label;
    this.#final = !!schemaDefinition.final;
    this.#extends = schemaDefinition.extends;
    this.#definition = schemaDefinition;
    if (schemaDefinition.fields && schemaDefinition.fields.length) {
      schemaDefinition.fields.forEach((fieldDefinition: any) => {
        this.#fields.push(
          new Field(
            this,
            fieldDefinition,
            this.#fieldTypeRegistry.getFieldType(fieldDefinition.type)
          )
        );
      });
    }

    this.validate();
  }

  getName(): string {
    return this.#name;
  }

  getLabel(): string {
    return this.#label;
  }

  getExtends(): string {
    return this.#extends;
  }

  isFinal(): boolean {
    return this.#final;
  }

  getDefinition(): any {
    return this.#definition;
  }

  getCollectionDefinition(): any {
    return {
      ...this.#definition,
      fields: undefined
    };
  }

  getExtendsStack(): string[] {
    let extendsStack = [this.getName()];
    const extendsCollectionName = this.getExtends();
    if (extendsCollectionName)
      extendsStack = extendsStack.concat(
        this.#getSchema(extendsCollectionName).getExtendsStack()
      );
    return extendsStack;
  }

  getBaseName(): string {
    let hostName = this.getName();
    const extendsCollectionName = this.getExtends();
    if (extendsCollectionName) {
      const extendedSchema = this.#getSchema(extendsCollectionName);
      hostName = extendedSchema.getBaseName();
    }
    return hostName;
  }

  getFields(): Field[] {
    let allFields: Field[] = [...this.#fields];

    const extendsCollectionName = this.getExtends();
    if (extendsCollectionName) {
      const extendedSchema = this.#getSchema(extendsCollectionName);
      allFields = allFields.concat(extendedSchema.getFields());
    } else {
      allFields.push(
        new Field(
          this,
          {
            name: '_id',
            type: 'objectId',
            dataType: 'objectId'
          },
          this.#fieldTypeRegistry.getFieldType('objectId')
        ),
        new Field(
          this,
          {
            name: '_collection',
            type: 'string',
            dataType: 'string'
          },
          this.#fieldTypeRegistry.getFieldType('string')
        )
      );
    }
    return allFields;
  }

  getField(name: string): Field | undefined {
    return this.getFields().find((field: Field) => {
      return field.getName() === name;
    });
  }

  async validateRecord(recordObject: any, context: any) {
    const fieldErrors: any[] = [];
    for (const field of this.getFields()) {
      try {
        await field.validateValue(recordObject, context);
      } catch (err) {
        fieldErrors.push(err);
      }
    }
    if (fieldErrors.length) {
      throw new RecordValidationError(
        this.getCollectionDefinition(),
        recordObject._id,
        fieldErrors
      );
    }
  }

  private validate() {
    if (!this.getName())
      throw new Error(
        `Collection name not provided :: ${this.getName()} :: ${this.getExtends()}`
      );
    if (typeof this.getName() !== 'string')
      throw new Error(
        `[Collection :: ${this.getName()}] Collection name should be a string`
      );
    if (!/^[a-z0-9_]+$/i.test(this.getName()))
      throw new Error(
        `[Collection :: ${this.getName()}] Collection name should be alphanumeric`
      );
    if (this.#schemaRegistry.hasSchema(this.getName()))
      throw new Error(
        `[Collection :: ${this.getName()}] Collection name already exists`
      );
    if (this.getExtends()) {
      if (!this.#schemaRegistry.hasSchema(this.getExtends()))
        throw new Error(
          `[Collection :: ${this.getName()}] cannot extend '${this.getExtends()}'. '${this.getExtends()}' does not exists.`
        );
      const extendsCol: Schema = this.#getSchema(this.getExtends());
      if (extendsCol.isFinal())
        throw new Error(
          `[Collection :: ${this.getName()}] cannot extend '${this.getExtends()}'. '${this.getExtends()}' is final schema.`
        );
    }

    const allFields = this.getFields();
    for (const fieldObject of allFields) {
      fieldObject.validate();
    }

    const fieldNames: string[] = allFields.map((f: Field) => f.getName());
    const duplicates = CommonUtils.findDuplicates(fieldNames);
    if (duplicates.length)
      throw new Error(
        `[Collection :: ${this.getName()}] Duplicate fields -> ${duplicates.join(
          ','
        )}`
      );
  }

  #getSchema(schemaName: string): Schema {
    const schema = this.#schemaRegistry.getSchema(schemaName);
    if (!schema) throw Error('[Schema::_getSchema] Schema not found');
    return schema;
  }
}
