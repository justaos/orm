const DatabaseConnector = require('./database-connector');
const QueryBuilder = require('./query-builder');
const ModelInterceptorProvider = require('./model-interceptor-provider');

class ModelBuilder {

    setInterceptProvider(interceptProvider) {
        this.interceptProvider = interceptProvider;
        return this;
    }

    build() {
        let modelBuilder = this;
        if (!this.interceptProvider) {
            this.interceptProvider = new ModelInterceptorProvider();
        }
        return function model(modelName) {
            let MongooseModel = DatabaseConnector.getInstance().getConnection().model(modelName);
            let inactiveIntercepts = [];

            class Model {

                constructor(plainRecord) {
                    this.record = new MongooseModel(plainRecord);
                }

                getID() {
                    return this.record._id;
                }

                set(key, value) {
                    this.record[key] = value;
                }

                get(key) {
                    return this.record[key];
                }

                async save(options) {
                    let operation = this.record.isNew ? 'create' : 'update';
                    let that = await modelBuilder.interceptProvider.intercept(Model.getModelName(), operation, 'before', this);
                    that.record = await that.record.save(options);
                    return await modelBuilder.interceptProvider.intercept(Model.getModelName(), operation, 'after', that);
                }

                async remove(options) {
                    let that = await modelBuilder.interceptProvider.intercept(Model.getModelName(), 'delete', 'before', this);
                    that.record = await that.record.remove(options);
                    return await modelBuilder.interceptProvider.intercept(Model.getModelName(), 'delete', 'after', that);
                }

                /**
                 * @param {Object} [conditions]
                 * @param {Object|String} [projection] optional fields to return
                 * @param {Object} [options] optional
                 * @return {Query}
                 */
                static find(conditions, projection, options) {
                    let mongooseQuery = MongooseModel.find(conditions, projection, options);
                    let query = new Query(mongooseQuery);
                    return populateReferenceFields(query, options);
                }

                /**
                 * @param {Object} [conditions]
                 * @param {Object|String} [projection] optional fields to return
                 * @param {Object} [options] optional
                 * @return {Query}
                 */
                static findOne(conditions, projection, options) {
                    let mongooseQuery = MongooseModel.findOne(conditions, projection, options);
                    let query = new Query(mongooseQuery);
                    return populateReferenceFields(query, options);
                }

                /**
                 * @param {Object|String|Number} id value of `_id` to query by
                 * @param {Object|String} [projection] optional fields to return
                 * @param {Object} [options] optional
                 * @return {Query}
                 */
                static findById(id, projection, options) {
                    if (typeof id === 'undefined') {
                        id = null;
                    }
                    return Model.findOne({
                        _id: id
                    }, projection, options);
                }

                static findOneAndUpdate(conditions, update, options) {
                    let mongooseQuery = MongooseModel.findOneAndUpdate(conditions, update, options);
                    let query = new Query(mongooseQuery);
                    return populateReferenceFields(query, options);
                }

                static upsert(conditions, update) {
                    return Model.findOneAndUpdate(conditions, update, {upsert: true, new: true});
                }

                static getDefinition() {
                    return MongooseModel.definition;
                }

                static getModelName() {
                    return modelName;
                }

                static deactivateIntercept(name) {
                    inactiveIntercepts.push(name);
                }

                static populateReferences() {
                    Model.isPopulate = true;
                    return this;
                }

                toJSON() {
                    return this.record.toObject();
                }

                toObject(options) {
                    return this.record.toObject(options);
                }
            }

            let Query = new QueryBuilder().setModel(Model).setIntercept(intercept).build();

            function intercept(operation, when, docs) {
                return modelBuilder.interceptProvider.intercept(Model.getModelName(), operation, when, docs, inactiveIntercepts);
            }

            function populateReferenceFields(query, options) {
                if (Model.isPopulate) {
                    let def = Model.getDefinition();
                    def.fields.forEach(function (field) {
                        if (field.type === 'reference' && field.ref) {
                            query = query.populate({path: field.name});
                        }
                    });
                }
                return query;
            }


            return Model;
        }
    }
}

module.exports = ModelBuilder;