class DummyInterceptor {

    // noinspection JSMethodCanBeStatic
    async intercept(operation, when, docs) {
        return docs;
    }
}

module.exports = DummyInterceptor;