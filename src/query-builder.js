class QueryBuilder {

    setModel(Model) {
        this.Model = Model;
        return this;
    }

    setIntercept(intercept) {
        this.intercept = intercept;
        return this;
    }

    build() {
        let queryBuild = this;
        return class Query {

            constructor(mongooseQuery) {
                this.query = mongooseQuery;
            }

            async exec() {
                await queryBuild.intercept('read', 'before', null);
                let docs = await this.query.exec();
                if (docs) {
                    if (Array.isArray(docs))
                        docs = docs.map(doc => new queryBuild.Model(doc));
                    else
                        docs = new queryBuild.Model(docs);
                }
                return await queryBuild.intercept('read', 'after', docs);
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

    }
}

module.exports = QueryBuilder;