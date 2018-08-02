const Query = require('./query');
const dummyInterceptor = new (require('./dummy-interceptor'))();
const Q = require('q');

let privateData = new WeakMap();

function _getModel(context) {
    return privateData.get(context).model;
}

function _getUser(context) {
    return privateData.get(context).user;
}

function _populateReferenceFields(context, query, options) {
    if (!privateData.get(context).skipPopulate) {
        let def = context.getDefinition();
        def.fields.forEach(function (field) {
            if (field.type === 'reference' && field.ref) {
                query = query.populate({path: field.name});
            }
        });
    }
    return query;
}

class Model {

    constructor(mongooseModel, user) {
        privateData.set(this, {});
        privateData.get(this).model = mongooseModel;
        privateData.get(this).user = user;
    }

    getDefinition() {
        return privateData.get(this).model.definition;
    }

    getInterceptor() {
        let that = this;
        /*
         * To be over written in ModelSession class.
         */
        return dummyInterceptor;
    }

    skipPopulation() {
        privateData.get(this).skipPopulate = true;
        return this;
    }

    /**
     * @param {Array|Object} docs Documents to insert, as a spread or array
     * @param {Object} [options] Options passed down to `save()`. To specify `options`, `docs` **must** be an array, not a spread.
     * @return {Promise}
     */
    create(docs, options) {
        let that = this;
        let user = _getUser(this);
        if (user) {
            if (Array.isArray(docs))
                docs.forEach(function (doc) {
                    doc.created_by = user.id;
                    doc.updated_by = user.id;
                });
            else {
                docs.created_by = user.id;
                docs.updated_by = user.id;
            }
        }
        let dfd = Q.defer();
        that.getInterceptor().intercept('create', 'before', docs).then(function (docs) {
            _getModel(that).create(docs, options).then(function (docs) {
                let args = arguments;
                that.getInterceptor().intercept('create', 'after', docs).then(function () {
                    dfd.resolve.apply(null, args);
                }).catch(function (err) {
                    dfd.reject(err);
                });
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    /**
     * @param {Object} [conditions]
     * @param {Object|String} [projection] optional fields to return
     * @param {Object} [options] optional
     * @return {Query}
     */
    find(conditions, projection, options) {
        let mongooseQuery = _getModel(this).find(conditions, projection, options);
        let query = new Query(mongooseQuery);
        query = _populateReferenceFields(this, query, options);
        return query;
    }

    /**
     * @param {Object|String|Number} id value of `_id` to query by
     * @param {Object|String} [projection] optional fields to return
     * @param {Object} [options] optional
     * @return {Query}
     */
    findById(id, projection, options) {
        if (typeof id === 'undefined') {
            id = null;
        }
        return this.findOne({
            _id: id
        }, projection, options);
    }

    /**
     * @param {Object} [conditions]
     * @param {Object|String} [projection] optional fields to return
     * @param {Object} [options] optional
     * @return {Query}
     */
    findOne(conditions, projection, options) {
        let mongooseQuery = _getModel(this).findOne(conditions, projection, options);
        let query = new Query(mongooseQuery);
        query = _populateReferenceFields(this, query, options);
        return query;
    }


    findOneAndUpdate(conditions, update, options) {
        let mongooseQuery = _getModel(this).findOneAndUpdate(conditions, update, options);
        let query = new Query(mongooseQuery);
        return _populateReferenceFields(this, query, options);
    }

    upsert(conditions, update) {
        return this.findOneAndUpdate(conditions, update, {upsert: true, new: true});
    }

    /**
     * @param {Object} conditions
     * @return {Query}
     */
    remove(conditions) {
        let mongooseQuery = _getModel(this).remove(conditions);
        return new Query(mongooseQuery);
    }

    /**
     * @param id
     * @returns {Query}
     */
    removeById(id) {
        return this.remove({_id: id});
    }

    /**
     * @param {Object} conditions
     * @param {Object} doc
     * @param {Object} [options] optional see [`Query.prototype.setOptions()`](http://mongoosejs.com/docs/api.html#query_Query-setOptions)
     * @return {Query}
     */
    update(conditions, doc, options) {
        let user = _getUser(this);
        if (user) {
            delete doc.created_by;
            doc.updated_by = user.id;
        }
        let mongooseQuery = _getModel(this).update(conditions, doc, options);
        return new Query(mongooseQuery);
    }

}

module.exports = Model;
