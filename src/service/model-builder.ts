import ModelInterceptorProvider from "../model-handler/model-interceptor-provider";
import QueryBuilder from "./query-builder";


export default class ModelBuilder {

    private modelName: string | undefined;
    private inactiveIntercepts: string[] = [];
    private interceptProvider: ModelInterceptorProvider | undefined;
    private MongooseModel: any;

    setModelName(modelName: string) {
        this.modelName = modelName;
    }

    setInterceptProvider(interceptProvider: ModelInterceptorProvider) {
        this.interceptProvider = interceptProvider;
    }

    setMongooseModel(MongooseModel: any) {
        this.MongooseModel = MongooseModel;
    }

    intercept(operation: string, when: string, docs: any) {
        if (!this.interceptProvider || !this.modelName)
            throw new Error("AnysolsModel::ModelBuilder::intercept -> undefined variables");
        return this.interceptProvider.intercept(this.modelName, operation, when, docs, this.inactiveIntercepts);
    }

    build(): any {
        let modelBuilder = this;
        let Query: any;

        class Model {

            record: any;

            constructor(plainRecord: any) {
                this.record = new modelBuilder.MongooseModel(plainRecord);
            }

            /**
             * @param {Object} [conditions]
             * @param {Object|String} [projection] optional fields to return
             * @param {Object} [options] optional
             * @return {Query}
             */
            static find(conditions: any, projection: any, options: any) {
                let mongooseQuery = modelBuilder.MongooseModel.find(conditions, projection, options);
                return new Query(mongooseQuery);
            }

            /**
             * @param {Object} [conditions]
             * @param {Object|String} [projection] optional fields to return
             * @param {Object} [options] optional
             * @return {Query}
             */
            static findOne(conditions: any, projection: any, options: any) {
                let mongooseQuery = modelBuilder.MongooseModel.findOne(conditions, projection, options);
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
                let mongooseQuery = modelBuilder.MongooseModel.findOneAndUpdate(conditions, update, options);
                return new Query(mongooseQuery);
            }

            static upsert(conditions: any, update: any) {
                return Model.findOneAndUpdate(conditions, update, {upsert: true, new: true});
            }

            static getDefinition() {
                // @ts-ignore
                return MongooseModel.definition;
            }

            static getModelName() {
                return modelBuilder.modelName;
            }

            static deactivateIntercept(name: string) {
                modelBuilder.inactiveIntercepts.push(name);
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
                let that = await modelBuilder.intercept(operation, 'before', this);
                that.record = await that.record.save(options);
                return await modelBuilder.intercept(operation, 'after', that);
            }

            async remove(options: any) {
                let that = await modelBuilder.intercept('delete', 'before', this);
                that.record = await that.record.remove(options);
                return await modelBuilder.intercept('delete', 'after', that);
            }

            toJSON() {
                return this.record.toObject();
            }

            toObject(options: any) {
                return this.record.toObject(options);
            }

        }

        Query = new QueryBuilder().setIntercept(modelBuilder.intercept).build();

        return Model;
    }
}
