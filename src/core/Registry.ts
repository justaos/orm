interface Type {
  getRegistryKey?(): string;
  [key: string]: any;
}

export default class Registry<T extends Type> {
  registry: Map<string, T> = new Map<string, T>();

  constructor() {}

  has = (name: string): boolean => this.registry.has(name);

  get = (name: string): T | undefined => this.registry.get(name);

  add = (item: T): void => {
    if (typeof item !== "object") {
      throw Error("Registry item must be an object");
    }
    if (!item) {
      throw Error("Registry item must not be null");
    }
    if (item.getRegistryKey) {
      this.registry.set(item.getRegistryKey(), item);
      return;
    }
    if (item.name) {
      this.registry.set(item.name, item);
      return;
    }
    throw Error("Registry item must have a name or getRegistryKey method");
  };

  delete = (collectionName: string): boolean =>
    this.registry.delete(collectionName);
}
