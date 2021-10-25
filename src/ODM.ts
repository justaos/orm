import { ObjectId } from 'mongodb';
import Collection from './collection/Collection';
import CollectionDefinitionRegistry from './collection/CollectionDefinitionRegistry';

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
import CollectionDefinition from './collection/CollectionDefinition';
import DateTimeFieldType from './field-types/types/DateTimeFieldType';
import AnyFieldType from './field-types/types/AnyFieldType';
import DatabaseConfiguration from './core/connection/databaseConfiguration';
import DatabaseConnection from './core/connection/databaseConnection';

const privates = new WeakMap();

export default class ODM {
  #fieldTypeRegistry: FieldTypeRegistry = new FieldTypeRegistry();
  #conn: DatabaseConnection | undefined;

  constructor() {
    const collectionDefinitionRegistry = new CollectionDefinitionRegistry();
    const operationInterceptorService = new OperationInterceptorService();
    privates.set(this, {
      collectionDefinitionRegistry,
      operationInterceptorService
    });
    _loadBuildInFieldTypes(this);
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

  defineCollection(schemaJson: any) {
    const schema = new Schema(
      schemaJson,
      this.#fieldTypeRegistry,
      _getCollectionDefinitionRegistry(this)
    );
    const col = new CollectionDefinition(
      this.#getConnection().getDBO().collection(schema.getBaseName()),
      schema,
      _getOperationInterceptorService(this)
    );
    _getCollectionDefinitionRegistry(this).addCollectionDefinition(col);
  }

  collection(colName: string, context?: any): Collection {
    const collectionDefinition: CollectionDefinition | undefined =
      _getCollectionDefinitionRegistry(this).getCollectionDefinition(colName);
    if (collectionDefinition === undefined)
      throw Error(`Collection with name '${colName}' does not exist`);
    return new Collection(collectionDefinition, context);
  }

  removeCollection(collectionName: string): void {
    _getCollectionDefinitionRegistry(this).deleteCollectionDefinition(
      collectionName
    );
  }

  getSchema(colName: string): Schema | undefined {
    const colDefinition: CollectionDefinition | undefined =
      _getCollectionDefinitionRegistry(this).getCollectionDefinition(colName);
    return colDefinition?.getSchema();
  }

  isCollectionDefined(collectionName: string): boolean {
    return _getCollectionDefinitionRegistry(this).hasCollectionDefinition(
      collectionName
    );
  }

  addFieldType(fieldType: FieldType): void {
    fieldType.setODM(this);
    this.#fieldTypeRegistry.addFieldType(fieldType);
  }

  addInterceptor(operationInterceptor: OperationInterceptorInterface): void {
    _getOperationInterceptorService(this).addInterceptor(operationInterceptor);
  }

  deleteInterceptor(operationInterceptorName: string): void {
    _getOperationInterceptorService(this).deleteInterceptor(
      operationInterceptorName
    );
  }

  generateNewObjectId(): ObjectId {
    return new ObjectId();
  }

  convertToObjectId(id: string): ObjectId {
    return new ObjectId(id);
  }

  #getConnection = (): DatabaseConnection => {
    if (!this.#conn)
      throw new Error('ODM::#getConnection -> There is no active connection');
    return this.#conn;
  };
}

/**
 * PRIVATE METHODS
 */

function _getCollectionDefinitionRegistry(
  that: ODM
): CollectionDefinitionRegistry {
  return privates.get(that).collectionDefinitionRegistry;
}

function _getOperationInterceptorService(
  that: ODM
): OperationInterceptorService {
  return privates.get(that).operationInterceptorService;
}

function _loadBuildInFieldTypes(that: ODM) {
  that.addFieldType(new StringFieldType());
  that.addFieldType(new IntegerFieldType());
  that.addFieldType(new DateFieldType());
  that.addFieldType(new ObjectFieldType());
  that.addFieldType(new BooleanFieldType());
  that.addFieldType(new ObjectIdFieldType());
  that.addFieldType(new DateTimeFieldType());
  that.addFieldType(new AnyFieldType());
}
