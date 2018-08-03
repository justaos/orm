const Query = require('./query');
const Q = require('q');

let privateData = new WeakMap();

function _getModel(context) {
    return privateData.get(context).model;
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

async function _intercept(context, operation, when, docs) {
    let interceptors = privateData.get(context).interceptors;
    if (interceptors) {
        let i;
        for (i = 0; i < interceptors.length; i++) {
            docs = await interceptors[i].intercept(operation, when, docs);
        }
    }
    return docs;
}

class Model {

    constructor(mongooseModel, ...interceptors) {
        privateData.set(this, {});
        privateData.get(this).model = mongooseModel;
        privateData.get(this).interceptors = interceptors;
    }

    getDefinition() {
        return privateData.get(this).model.definition;
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
    async create(docs, options) {
        let that = this;
        docs = await _intercept(that, 'create', 'before', docs);
        docs = await _getModel(that).create(docs, options);
        await _intercept(that, 'create', 'after', docs);
        return docs;
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
    async update(conditions, doc, options) {
        let that = this;
        doc = await _intercept(that, 'update', 'before', doc);
        let mongooseQuery = _getModel(this).update(conditions, doc, options);
        return new Query(mongooseQuery, function (when, docs) {
            return new Promise((resolve, reject) => {
                if (when === 'after') {
                    _intercept(that, 'update', when, docs).then(function () {
                        resolve();
                    });
                } else {
                    resolve();
                }
            })
        }).exec();
    }

}

module.exports = Model;
