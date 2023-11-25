interface Type2 {
  getName(): string;
}

export default class Registry<T extends Type2> {
  registry: Map<string, T> = new Map<string, T>();

  constructor() {}

  has = (name: string): boolean => this.registry.has(name);

  get = (name: string): T | undefined => this.registry.get(name);

  add = (item: T): void => {
    if (typeof item !== "object") {
      throw Error("Collection must be an object");
    }
    if (!item) {
      throw Error("Collection must not be null");
    }
    this.registry.set(item.getName(), item);
  };

  delete = (collectionName: string): boolean =>
    this.registry.delete(collectionName);
}
