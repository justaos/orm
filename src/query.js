class Query {

    constructor(mongooseQuery) {
        this.query = mongooseQuery;
    }

    exec(cb) {
        let that = this;
        if (cb)
            this.query.exec(function (err, docs) {
                // intercept here
                cb(err, docs);
            });
        else {
            return new Promise((resolve, reject) => {
                that.query.exec().then(function (docs) {
                    // intercept here
                    resolve(docs);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }

    populate() {
        this.query = this.query.populate.apply(this.query, arguments);
        return this;
    }

    remove(filter) {
        this.query = this.query.remove(filter);
        return this;
    }

}

module.exports = Query;
