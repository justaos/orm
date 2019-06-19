import DatabaseConfiguration from "./model/database-configuration";
import DatabaseConnection from "./service/database-connection";
import ModelService from "./service/model-service";
import ModelInterceptorProvider from "./service/model-interceptor-provider";
import QueryBuilder from "./service/query-builder";
import ModelInterceptor from "./model/model-interceptor";


export class AnysolsModel {

    private readonly dbConfig: DatabaseConfiguration;
    private conn: DatabaseConnection | undefined;
    private interceptProvider: ModelInterceptorProvider;

    constructor(config: any) {
        this.dbConfig = new DatabaseConfiguration(config.host, config.port, config.name, config.user, config.password, config.dialect);
        this.interceptProvider = new ModelInterceptorProvider();
    }

    async connect() {
        this.conn = await DatabaseConnection.connect(this.dbConfig);
        return this.conn;
    }

    closeConnection() {
        if (!this.conn)
            throw new Error("AnysolsModel::closeConnection -> There is no active connection");
        this.conn.closeConnection();
    }

    /*databaseExists() {
        if (!this.conn)
            throw new Error("AnysolsModel::databaseExists -> There is no active connection");
        return this.conn.databaseExists(this.dbConfig.getDatabaseName());
    }*/

   /* dropDatabase() {
        if (!this.conn)
            throw new Error("AnysolsModel::dropDatabase -> There is no active connection");
        return this.conn.dropDatabase();
    }*/

    isModelDefined(modelName: string) {
        if (!this.conn)
            throw new Error("AnysolsModel::isModelDefined -> There is no active connection");
        return new ModelService(this.conn).isModelDefined(modelName);
    }

    defineModel(schemaDefinition: any) {
        if (!this.conn)
            throw new Error("AnysolsModel::isModelDefined -> There is no active connection");
        return new ModelService(this.conn).defineModel(schemaDefinition);
    }

    model(modelName: string): any {
        let modelBuilder = this;

        // @ts-ignore
        let MongooseModel = this.conn.model(modelName);
        let inactiveIntercepts: string[] = [];

        class Model {

            record: any;

            constructor(plainRecord: any) {
              //  this.record = new MongooseModel(plainRecord);
            }

            /**
             * @param {Object} [conditions]
             * @param {Object|String} [projection] optional fields to return
             * @param {Object} [options] optional
             * @return {Query}
             */
            static find(conditions: any, projection: any, options: any) {
             //   let mongooseQuery = MongooseModel.find(conditions, projection, options);
               // return new Query(mongooseQuery);
            }

            /**
             * @param {Object} [conditions]
             * @param {Object|String} [projection] optional fields to return
             * @param {Object} [options] optional
             * @return {Query}
             */
            static findOne(conditions: any, projection: any, options: any) {
            //    let mongooseQuery = MongooseModel.findOne(conditions, projection, options);
              //  return new Query(mongooseQuery);
            }

            /**
             * @param {Object|String|Number} id value of `_id` to query by
             * @param {Object|String} [projection] optional fields to return
             * @param {Object} [options] optional
             * @return {Query}
             */
            static findById(id: any, projection: any, options: any) {
                if (typeof id === 'undefined') {
                    id = null;
                }
                return Model.findOne({
                    _id: id
                }, projection, options);
            }

            static findOneAndUpdate(conditions: any, update: any, options: any) {
             //   let mongooseQuery = MongooseModel.findOneAndUpdate(conditions, update, options);
               // return new Query(mongooseQuery);
            }

            static upsert(conditions: any, update: any) {
                return Model.findOneAndUpdate(conditions, update, {upsert: true, new: true});
            }

            static getDefinition() {
                // @ts-ignore
                return MongooseModel.definition;
            }

            static getModelName() {
                return modelName;
            }

            static deactivateIntercept(name: string) {
                inactiveIntercepts.push(name);
            }

            getID() {
                return this.record._id;
            }

            set(key: string, value: any) {
                this.record[key] = value;
            }

            get(key: string) {
                return this.record[key];
            }

            async save(options: any) {
                let operation = this.record.isNew ? 'create' : 'update';
                // @ts-ignore
                let that = await intercept(operation, 'before', this);
                that.record = await that.record.save(options);
                // @ts-ignore
                return await intercept(operation, 'after', that);
            }

            async remove(options: any) {
                // @ts-ignore
                let that = await intercept('delete', 'before', this);
                that.record = await that.record.remove(options);
                // @ts-ignore
                return await intercept('delete', 'after', that);
            }

            toJSON() {
                return this.record.toObject();
            }

            toObject(options: any) {
                return this.record.toObject(options);
            }
        }

        let Query = new QueryBuilder().setModel(Model).setIntercept(intercept).build();

        function intercept(operation: string, when: string, docs: any) {
            // @ts-ignore
            return modelBuilder.interceptProvider.intercept(modelName, operation, when, docs, inactiveIntercepts);
        }

        return Model;
    }

    addInterceptor(name: string, interceptor: ModelInterceptor) {
        this.interceptProvider.addInterceptor(name, interceptor);
    }

}
