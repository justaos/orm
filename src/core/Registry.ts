interface Type {
  getRegistryKey?(): string;

  [key: string]: any;
}

export default class Registry<T extends Type> {
  registry: Map<string, T> = new Map<string, T>();

  readonly #getKey: (item: T) => string;

  constructor(getKey: (item: T) => string) {
    this.#getKey = getKey;
  }

  has = (name: string): boolean => this.registry.has(name);

  get = (name: string): T | undefined => this.registry.get(name);

  add = (item: T): void => {
    if (typeof item !== "object") {
      throw Error("Registry item must be an object");
    }
    if (!item) {
      throw Error("Registry item must not be null");
    }

    this.registry.set(this.#getKey(item), item);
  };

  delete = (name: string): boolean => this.registry.delete(name);
}
