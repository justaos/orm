import DatabaseService from "./database/database-service";
import ModelInterceptorProvider from "./model-handler/model-interceptor-provider";
import ModelInterceptor from "./model-handler/model/model-interceptor";
import ModelService from "./model-handler/model-service";
import QueryBuilder from "./service/query-builder";

export class AnysolsModel extends DatabaseService {

    private interceptProvider: ModelInterceptorProvider;

    constructor() {
        super();
        this.interceptProvider = new ModelInterceptorProvider();
    }

    isModelDefined(modelName: string) {
        this.getModelService().isModelDefined(modelName);
    }

    defineModel(schemaDefinition: any) {
        this.getModelService().defineModel(schemaDefinition);
    }

    addInterceptor(name: string, interceptor: ModelInterceptor) {
        this.interceptProvider.addInterceptor(name, interceptor);
    }


    model(modelName: string): any {
        let modelBuilder = this;
        let MongooseModel = this.getModelService().model(modelName);
        let inactiveIntercepts: string[] = [];
        let Query: any;

        class Model {

            record: any;

            constructor(plainRecord: any) {
                this.record = new MongooseModel(plainRecord);
            }

            /**
             * @param {Object} [conditions]
             * @param {Object|String} [projection] optional fields to return
             * @param {Object} [options] optional
             * @return {Query}
             */
            static find(conditions: any, projection: any, options: any) {
                let mongooseQuery = MongooseModel.find(conditions, projection, options);
                return new Query(mongooseQuery);
            }

            /**
             * @param {Object} [conditions]
             * @param {Object|String} [projection] optional fields to return
             * @param {Object} [options] optional
             * @return {Query}
             */
            static findOne(conditions: any, projection: any, options: any) {
                let mongooseQuery = MongooseModel.findOne(conditions, projection, options);
                return new Query(mongooseQuery);
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
                let mongooseQuery = MongooseModel.findOneAndUpdate(conditions, update, options);
                return new Query(mongooseQuery);
            }

            static upsert(conditions: any, update: any) {
                return Model.findOneAndUpdate(conditions, update, {upsert: true, new: true});
            }

            static getDefinition() {
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
                let that = await intercept(operation, 'before', this);
                that.record = await that.record.save(options);
                return await intercept(operation, 'after', that);
            }

            async remove(options: any) {
                let that = await intercept('delete', 'before', this);
                that.record = await that.record.remove(options);
                return await intercept('delete', 'after', that);
            }

            toJSON() {
                return this.record.toObject();
            }

            toObject(options: any) {
                return this.record.toObject(options);
            }
        }

        Query = new QueryBuilder().setModel(Model).setIntercept(intercept).build();

        function intercept(operation: string, when: string, docs: any) {
            return modelBuilder.interceptProvider.intercept(modelName, operation, when, docs, inactiveIntercepts);
        }

        return Model;
    }

    private getModelService() {
        if (!this.conn)
            throw new Error("AnysolsModel::isModelDefined -> There is no active connection");
        return new ModelService(this.conn);
    }

}
