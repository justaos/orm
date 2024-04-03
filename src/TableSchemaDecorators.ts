export function Table() {
  return (target: any) => {
    if (!target.__tableDefinition) {
      target.__tableDefinition = {
        columns: [],
      };
    }
    if (!Array.isArray(target.__tableDefinition.columns)) {
      target.__tableDefinition.columns = Object.keys(
        target.__tableDefinition.columns,
      ).map((key) => {
        return {
          name: key,
          ...target.__tableDefinition.columns[key],
        };
      });
    }
    target.__tableDefinition.name = target.name
      .split(/(?=[A-Z])/)
      .join("_")
      .toLowerCase();
  };
}

function columnInitializer(target: any, key: string | symbol) {
  if (!target.constructor.__tableDefinition) {
    target.constructor.__tableDefinition = {
      columns: {},
    };
  }
  if (!target.constructor.__tableDefinition.columns[key]) {
    target.constructor.__tableDefinition.columns[key] = {};
  }
}

export function DataTypeString() {
  return function (target: any, key: string | symbol) {
    columnInitializer(target, key);
    target.constructor.__tableDefinition.columns[key].type = "string";
  };
}

export function DataTypeInteger() {
  return function (target: any, key: string | symbol) {
    columnInitializer(target, key);
    target.constructor.__tableDefinition.columns[key].type = "integer";
  };
}
