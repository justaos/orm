import DatabaseConnector from "./database-connector";

import {ModelInterceptorProvider} from "./model-interceptor-provider";

import QueryBuilder from "./query.builder";

export class ModelBuilder {

    interceptProvider: any;

    setInterceptProvider(interceptProvider: ModelInterceptorProvider) {
        this.interceptProvider = interceptProvider;
        return this;
    }

    build(): any {
        let modelBuilder = this;
        if (!this.interceptProvider) {
            this.interceptProvider = new ModelInterceptorProvider();
        }
        return function model(modelName: string) {
            let MongooseModel = DatabaseConnector.getInstance().getConnection().model(modelName);
            let inactiveIntercepts: string[] = [];

            class Model {

                record: any;

                constructor(plainRecord: any) {
                    this.record = new MongooseModel(plainRecord);
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
                    let that = await modelBuilder.interceptProvider.intercept(Model.getModelName(), operation, 'before', this);
                    that.record = await that.record.save(options);
                    // @ts-ignore
                    return await modelBuilder.interceptProvider.intercept(Model.getModelName(), operation, 'after', that);
                }

                async remove(options: any) {
                    // @ts-ignore
                    let that = await modelBuilder.interceptProvider.intercept(Model.getModelName(), 'delete', 'before', this);
                    that.record = await that.record.remove(options);
                    // @ts-ignore
                    return await modelBuilder.interceptProvider.intercept(Model.getModelName(), 'delete', 'after', that);
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
                return modelBuilder.interceptProvider.intercept(Model.getModelName(), operation, when, docs, inactiveIntercepts);
            }

            return Model;
        }
    }
}
