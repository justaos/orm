/*
import OperationInterceptorService from "./operation-interceptor/OperationInterceptorService.ts";
import OperationInterceptorInterface from "./operation-interceptor/OperationInterceptor.interface.ts";
*/
import { DatabaseConfigurationOptions, DatabaseConnection } from "./core/connection/index.ts";
import Registry from "./collection/Registry.ts";
import Schema from "./collection/Schema.ts";
import FileType from "./field-types/FieldType.ts";
import FieldType from "./field-types/FieldType.ts";

import StringFieldType from "./field-types/types/StringFieldType.ts";
/*import IntegerFieldType from "./field-types/types/IntegerFieldType.ts";
import DateFieldType from "./field-types/types/DateFieldType.ts";

import ObjectFieldType from "./field-types/types/ObjectFieldType.ts";
import BooleanFieldType from "./field-types/types/BooleanFieldType.ts";
import ObjectIdFieldType from "./field-types/types/ObjectIdFieldType.ts";
import DateTimeFieldType from "./field-types/types/DateTimeFieldType.ts";
import AnyFieldType from "./field-types/types/AnyFieldType.ts";
import NumberFieldType from "./field-types/types/NumberFieldType.ts";*/

export default class ODM {
  #conn: DatabaseConnection | undefined;
  #fieldTypeRegistry: Registry<FileType> = new Registry<FileType>();
  #schemaRegistry: Registry<Schema> = new Registry<Schema>();

  /*  #operationInterceptorService: OperationInterceptorService =
      new OperationInterceptorService();*/

  constructor() {
    this.#loadBuildInFieldTypes();
  }

  async connect(
    config: DatabaseConfigurationOptions,
    createDatabaseIfNotExists?: boolean
  ): Promise<void> {
    try {
      this.#conn = new DatabaseConnection(config);
      await this.#conn.connect();
    } catch (error) {
      if (
        error.name === "PostgresError" &&
        error.code === "3D000" &&
        config.database &&
        createDatabaseIfNotExists
      ) {
        const tempConn = new DatabaseConnection({
          ...config,
          database: "postgres"
        });
        await tempConn.connect();
        await tempConn.createDatabase(config.database);
        await this.connect(config, false);
      } else {
        throw error;
      }
    }
  }

  closeConnection(): Promise<void> {
    return this.#getConnection().closeConnection();
  }

  dropDatabase(): Promise<boolean> {
    return this.#getConnection().dropDatabase();
  }

  defineCollection(schemaJson: any): void {
    const schema = new Schema(
      schemaJson,
      this.#fieldTypeRegistry,
      this.#schemaRegistry
    );
    this.#schemaRegistry.add(schema);
  }

  /*collection(collectionName: string, context?: any): Collection {
    const schema: Schema | undefined =
      this.#schemaRegistry.getSchema(collectionName);
    if (schema === undefined) {
      throw Error(`Collection with name '${collectionName}' is not defined`);
    }
    return new Collection(
      this.#getConnection().getDBO().collection(schema.getBaseName()),
      schema,
      this.#operationInterceptorService,
      context
    );
  }*/

  getSchema(name: string): Schema | undefined {
    return this.#schemaRegistry.get(name);
  }

  isCollectionDefined(collectionName: string): boolean {
    return this.#schemaRegistry.has(collectionName);
  }

  addFieldType(FieldTypeClass: new (odm: ODM) => FieldType): void {
    this.#fieldTypeRegistry.add(new FieldTypeClass(this));
  }

  /* addInterceptor(operationInterceptor: OperationInterceptorInterface): void {
     this.#operationInterceptorService.addInterceptor(operationInterceptor);
   }
 
   deleteInterceptor(operationInterceptorName: string): void {
     this.#operationInterceptorService.deleteInterceptor(
       operationInterceptorName
     );
   }
 */

  /* generateObjectId(id?: string): ObjectId {
    return new mongodb.ObjectId(id);
  }

  isObjectId(value: any): boolean {
    return mongodb.ObjectId.isValid(value);
  }*/

  #loadBuildInFieldTypes(): void {
    this.addFieldType(StringFieldType);
    /* this.addFieldType(IntegerFieldType);
     this.addFieldType(NumberFieldType);
     this.addFieldType(DateFieldType);
     this.addFieldType(ObjectFieldType);
     this.addFieldType(BooleanFieldType);
     this.addFieldType(ObjectIdFieldType);
     this.addFieldType(DateTimeFieldType);
     this.addFieldType(AnyFieldType);*/
  }

  #getConnection(): DatabaseConnection {
    if (!this.#conn) {
      throw new Error("ODM::#getConnection -> There is no active connection");
    }
    return this.#conn;
  }
}
