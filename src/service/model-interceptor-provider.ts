import ModelInterceptor from "../model/model-interceptor";

export default class ModelInterceptorProvider {

    interceptors: Array<any>;

    constructor() {
        this.interceptors = [];
    }

    addInterceptor(name: string, interceptor: ModelInterceptor) {
        this.interceptors.push({name, interceptor});
    }

    removeInterceptor(name: string) {
        this.interceptors = this.interceptors.filter(function (interceptor) {
            return name === interceptor.name;
        })
    }

    reset() {
        this.interceptors = [];
    }

    deactivate() {

    }

    async intercept(modelName: string, operation: string, when: string, records: any /* single or array of records */, inactiveIntercepts: Array<string>) {
        //  console.log(modelName + ' :: ' + operation + ' : ' + when);
        if (this.interceptors) {
            let i;
            for (i = 0; i < this.interceptors.length; i++) {
                if (!inactiveIntercepts || !inactiveIntercepts.includes(this.interceptors[i].name)) {
                    records = await this.interceptors[i].interceptor.intercept(modelName, operation, when, records);
                    if (!records)
                        break;
                }
            }
        }
        return records;
    }
}
