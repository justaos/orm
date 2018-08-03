class Query {

    constructor(mongooseQuery, intercept) {
        this.query = mongooseQuery;
        this.intercept = intercept || function(){

        }
    }

    async exec() {
        let that = this;
        await that.intercept('before', null);
        let docs = await this.query.exec();
        await that.intercept('after', docs);
        return docs;
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
