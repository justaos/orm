export default class TableNameUtils {
  static getFullFormTableName(name: string): string {
    const parts = name.split(".");
    let schemaName = "public";
    let tableName = name;
    if (parts.length == 2) {
      schemaName = parts[0];
      tableName = parts[1];
    }
    return `${schemaName}.${tableName}`;
  }

  static getShortFormTableName(name: string): string {
    const parts = name.split(".");
    if (parts.length == 2 && parts[0] === "public") {
      return parts[1];
    }
    return name;
  }

  static getTableNameWithoutSchema(name: string): string {
    const parts = name.split(".");
    if (parts.length == 2) {
      return parts[1];
    }
    return name;
  }
}