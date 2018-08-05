const _ = require('lodash');

class ModelInterceptorProvider {

    constructor() {
        this.interceptors = [];
    }

    register(name, interceptor) {
        this.interceptors.push({name, interceptor});
    }

    deregister(name) {
        _.remove(this.interceptors, function (interceptor) {
            return name === interceptor.name;
        })
    }

    deactivate() {

    }

    async intercept(modelName, operation, when, records /* single or array of records */, inactiveIntercepts) {
      //  console.log(modelName + ' :: ' + operation + ' : ' + when);
        if (this.interceptors) {
            let i;
            for (i = 0; i < this.interceptors.length; i++) {
                if (!inactiveIntercepts || !_.includes(inactiveIntercepts, this.interceptors[i].name)) {
                    records = await this.interceptors[i].interceptor.intercept(modelName, operation, when, records);
                    if (!records)
                        break;
                }
            }
        }
        return records;
    }
}

module.exports = ModelInterceptorProvider;
