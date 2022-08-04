import { mongodb } from '../deps.ts';

import Collection from './collection/Collection.ts';
import SchemaRegistry from './collection/SchemaRegistry.ts';

import OperationInterceptorService from './operation-interceptor/OperationInterceptorService.ts';
import OperationInterceptorInterface from './operation-interceptor/OperationInterceptor.interface.ts';

import Schema from './collection/Schema.ts';

import FieldType from './field-types/FieldType.ts';
import StringFieldType from './field-types/types/StringFieldType.ts';
import IntegerFieldType from './field-types/types/IntegerFieldType.ts';
import DateFieldType from './field-types/types/DateFieldType.ts';
import FieldTypeRegistry from './field-types/FieldTypeRegistry.ts';
import ObjectFieldType from './field-types/types/ObjectFieldType.ts';
import BooleanFieldType from './field-types/types/BooleanFieldType.ts';
import ObjectIdFieldType from './field-types/types/ObjectIdFieldType.ts';
import DateTimeFieldType from './field-types/types/DateTimeFieldType.ts';
import AnyFieldType from './field-types/types/AnyFieldType.ts';
import DatabaseConfiguration from './core/connection/databaseConfiguration.ts';
import DatabaseConnection from './core/connection/databaseConnection.ts';
import NumberFieldType from './field-types/types/NumberFieldType.ts';
import ObjectId from './record/ObjectId.ts';

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

  async connectByUri(uri: string): Promise<void> {
    if (!uri) throw new Error('ODM::connect -> There is no config provided');
    const conn = await DatabaseConnection.connectByUri(uri);
    await conn.deleteAllIndexes();
    this.#conn = conn;
  }

  closeConnection(): void {
    const conn = this.#getConnection();
    conn.closeConnection();
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

  addFieldType(FieldTypeClass: new (odm: ODM) => FieldType): void {
    this.#fieldTypeRegistry.addFieldType(new FieldTypeClass(this));
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
    return new mongodb.ObjectId(id);
  }

  #loadBuildInFieldTypes(): void {
    this.addFieldType(StringFieldType);
    this.addFieldType(IntegerFieldType);
    this.addFieldType(NumberFieldType);
    this.addFieldType(DateFieldType);
    this.addFieldType(ObjectFieldType);
    this.addFieldType(BooleanFieldType);
    this.addFieldType(ObjectIdFieldType);
    this.addFieldType(DateTimeFieldType);
    this.addFieldType(AnyFieldType);
  }

  #getConnection(): DatabaseConnection {
    if (!this.#conn)
      throw new Error('ODM::#getConnection -> There is no active connection');
    return this.#conn;
  }
}
