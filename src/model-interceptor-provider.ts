import * as _ from 'lodash';

export default class ModelInterceptorProvider {

    interceptors: Array<any>;

    constructor() {
        this.interceptors = [];
    }

    register(name: string, interceptor: any) {
        this.interceptors.push({name, interceptor});
    }

    deregister(name: string) {
        _.remove(this.interceptors, function (interceptor) {
            return name === interceptor.name;
        })
    }

    deactivate() {

    }

    async intercept(modelName: string, operation: string, when: string, records: any /* single or array of records */, inactiveIntercepts: Array<string>) {
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
