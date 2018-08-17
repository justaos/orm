export default class QueryBuilder {

    Model: any;
    intercept: any;

    setModel(Model: any) {
        this.Model = Model;
        return this;
    }

    setIntercept(intercept: any) {
        this.intercept = intercept;
        return this;
    }

    build() {
        let queryBuild = this;
        return class Query {

            query: any;

            constructor(mongooseQuery: any) {
                this.query = mongooseQuery;
            }

            async exec() {
                // @ts-ignore
                await queryBuild.intercept('read', 'before', null);
                let docs = await this.query.exec();
                if (docs) {
                    if (Array.isArray(docs))
                        docs = docs.map(doc => new queryBuild.Model(doc));
                    else
                        docs = new queryBuild.Model(docs);
                }
                // @ts-ignore
                return await queryBuild.intercept('read', 'after', docs);
            }

            populate(props: any) {
                this.query = this.query.populate.apply(this.query, arguments);
                return this;
            }

            populateRefs() {
                let that = this;
                let def = queryBuild.Model.getDefinition();
                def.fields.forEach(function (field: any) {
                    if (field.type === 'reference' && field.ref) {
                        that.populate({path: field.name});
                    }
                });
                return this;
            }


            remove(filter: any) {
                this.query = this.query.remove.apply(this.query, arguments);
                return this;
            }

        }

    }
}
