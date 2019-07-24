import ModelInterceptor from "./model/model-interceptor";

export default class ModelInterceptorProvider {

    interceptors: Map<string, ModelInterceptor>;

    constructor() {
        this.interceptors = new Map<string, ModelInterceptor>();
    }

    addInterceptor(name: string, interceptor: ModelInterceptor) {
        this.interceptors.set(name, interceptor);
    }

    removeInterceptor(name: string) {
        this.interceptors.get(name);
    }

    reset() {
        this.interceptors = new Map<string, ModelInterceptor>();
    }

    deactivate() {

    }

    async intercept(modelName: string, operation: string, when: string, records: any /* single or array of records */, inactiveIntercepts: Array<string>) {
        if (this.interceptors) {
            let i;
            for (const [name, intercept] of this.interceptors.entries()) {
                if (!inactiveIntercepts || !inactiveIntercepts.includes(name)) {
                    records = await intercept.intercept(modelName, operation, when, records);
                    if (!records)
                        break;
                }
            }
        }
        return records;
    }
}
