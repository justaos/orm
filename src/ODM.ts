import { ObjectId } from 'mongodb';
import Collection from './collection/Collection';
import SchemaRegistry from './collection/SchemaRegistry';

import OperationInterceptorService from './operation-interceptor/OperationInterceptorService';
import OperationInterceptorInterface from './operation-interceptor/OperationInterceptor.interface';

import Schema from './collection/Schema';

import FieldType from './field-types/FieldType.interface';
import StringFieldType from './field-types/types/StringFieldType';
import IntegerFieldType from './field-types/types/IntegerFieldType';
import DateFieldType from './field-types/types/DateFieldType';
import FieldTypeRegistry from './field-types/FieldTypeRegistry';
import ObjectFieldType from './field-types/types/ObjectFieldType';
import BooleanFieldType from './field-types/types/BooleanFieldType';
import ObjectIdFieldType from './field-types/types/ObjectIdFieldType';
import DateTimeFieldType from './field-types/types/DateTimeFieldType';
import AnyFieldType from './field-types/types/AnyFieldType';
import DatabaseConfiguration from './core/connection/databaseConfiguration';
import DatabaseConnection from './core/connection/databaseConnection';
import NumberFieldType from './field-types/types/NumberFieldType';

export default class ODM {
  #conn: DatabaseConnection | undefined;
  #fieldTypeRegistry: FieldTypeRegistry = new FieldTypeRegistry();
  #schemaRegistry: SchemaRegistry = new SchemaRegistry();
  #operationInterceptorService: OperationInterceptorService =
    new OperationInterceptorService();

  constructor() {
    this.#loadBuildInFieldTypes();
  }

  async connect(config: any): Promise<void> {
    if (!config) throw new Error('ODM::connect -> There is no config provided');
    const dbConfig = new DatabaseConfiguration(
      config.host,
      config.port,
      config.dialect,
      config.database,
      config.username,
      config.password
    );
    const conn = await DatabaseConnection.connect(dbConfig);
    await conn.deleteAllIndexes();
    this.#conn = conn;
  }

  closeConnection(): Promise<void> {
    const conn = this.#getConnection();
    return conn.closeConnection();
  }

  databaseExists(): Promise<boolean> {
    const conn = this.#getConnection();
    return conn.databaseExists();
  }

  dropDatabase(): Promise<boolean> {
    const conn = this.#getConnection();
    return conn.dropDatabase();
  }

  defineCollection(schemaJson: any): void {
    const schema = new Schema(
      schemaJson,
      this.#fieldTypeRegistry,
      this.#schemaRegistry
    );
    this.#schemaRegistry.addSchema(schema);
  }

  collection(collectionName: string, context?: any): Collection {
    const schema: Schema | undefined =
      this.#schemaRegistry.getSchema(collectionName);
    if (schema === undefined)
      throw Error(`Collection with name '${collectionName}' is not defined`);
    return new Collection(
      this.#getConnection().getDBO().collection(schema.getBaseName()),
      schema,
      this.#operationInterceptorService,
      context
    );
  }

  getSchema(name: string): Schema | undefined {
    return this.#schemaRegistry.getSchema(name);
  }

  isCollectionDefined(collectionName: string): boolean {
    return this.#schemaRegistry.hasSchema(collectionName);
  }

  addFieldType(fieldType: FieldType): void {
    fieldType.setODM(this);
    this.#fieldTypeRegistry.addFieldType(fieldType);
  }

  addInterceptor(operationInterceptor: OperationInterceptorInterface): void {
    this.#operationInterceptorService.addInterceptor(operationInterceptor);
  }

  deleteInterceptor(operationInterceptorName: string): void {
    this.#operationInterceptorService.deleteInterceptor(
      operationInterceptorName
    );
  }

  generateObjectId(id?: string): ObjectId {
    return new ObjectId(id);
  }

  #loadBuildInFieldTypes(): void {
    this.addFieldType(new StringFieldType());
    this.addFieldType(new IntegerFieldType());
    this.addFieldType(new NumberFieldType());
    this.addFieldType(new DateFieldType());
    this.addFieldType(new ObjectFieldType());
    this.addFieldType(new BooleanFieldType());
    this.addFieldType(new ObjectIdFieldType());
    this.addFieldType(new DateTimeFieldType());
    this.addFieldType(new AnyFieldType());
  }

  #getConnection(): DatabaseConnection {
    if (!this.#conn)
      throw new Error('ODM::#getConnection -> There is no active connection');
    return this.#conn;
  }
}
