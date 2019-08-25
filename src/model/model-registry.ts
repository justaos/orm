import Model from "./model";

export default class ModelRegistry {

    models: Map<string, Model>;

    constructor() {
        this.models = new Map<string, Model>();
    }

    hasModel(modelName: string) {
        return this.models.has(modelName);
    }

    getModel(modelName: string) {
        return this.models.get(modelName)
    }

    addModel = (model: Model) => this.models.set(model.getName(), model);

    deleteModel = (type: string) => this.models.delete(type);

};
