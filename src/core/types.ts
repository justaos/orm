/**
 * DatabaseConfiguration type defines the configuration options for a database connection.
 *
 * @property {string} [hostname] - The hostname of the database server.
 * @property {number} [port] - The port number on which the database server is listening.
 * @property {string} [database] - The name of the database to connect to.
 * @property {string} [username] - The username for the database connection.
 * @property {string} [password] - The password for the database connection.
 * @property {number} [max_connections] - The maximum number of connections allowed to the database.
 * @property {number} [connect_timeout] - The maximum time to wait for a connection to the database before timing out.
 */
export type TDatabaseConfiguration = {
  hostname?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  max_connections?: number;
  connect_timeout?: number;
};

export type TLogicalOperator = "OR" | "AND";

export const WHERE_CLAUSE_OPERATORS_CONFIG = {
  EQUAL: { type: "=", description: "Equal" },
  NOT_EQUAL: { type: "!=", description: "Not Equal" },
  GREATER_THAN: { type: ">", description: "Greater Than" },
  LESS_THAN: { type: "<", description: "Less Than" },
  GREATER_THAN_OR_EQUAL: { type: ">=", description: "Greater Than or Equal" },
  LESS_THAN_OR_EQUAL: { type: "<=", description: "Less Than or Equal" },
  NOT_EQUAL2: { type: "<>", description: "Not Equal" },
  LIKE: { type: "LIKE", description: "Like" },
  ILIKE: { type: "ILIKE", description: "ILike" },
  BETWEEN: { type: "BETWEEN", description: "Between" },
  NOT_BETWEEN: { type: "NOT BETWEEN", description: "Not Between" },
  IN: { type: "IN", description: "In", arrayValues: true },
  NOT_IN: { type: "NOT IN", description: "Not In", arrayValues: true },
  IS_NULL: { type: "IS NULL", description: "Is Null", noValue: true },
  IS_NOT_NULL: {
    type: "IS NOT NULL",
    description: "Is Not Null",
    noValue: true,
  },
  IS_TRUE: { type: "IS TRUE", description: "Is True", noValue: true },
  IS_NOT_TRUE: {
    type: "IS NOT TRUE",
    description: "Is Not True",
    noValue: true,
  },
  IS_FALSE: { type: "IS FALSE", description: "Is False", noValue: true },
  IS_NOT_FALSE: {
    type: "IS NOT FALSE",
    description: "Is Not False",
    noValue: true,
  },
  IS_UNKNOWN: { type: "IS UNKNOWN", description: "Is Unknown", noValue: true },
  IS_NOT_UNKNOWN: {
    type: "IS NOT UNKNOWN",
    description: "Is Not Unknown",
    noValue: true,
  },
};

export const WHERE_CLAUSE_OPERATORS: TWhereClauseOperator[] = [];
for (const obj of Object.values(WHERE_CLAUSE_OPERATORS_CONFIG)) {
  WHERE_CLAUSE_OPERATORS.push(<TWhereClauseOperator> obj.type);
}

export const WHERE_CLAUSE_OPERATORS_ARRAY_VALUES: TWhereClauseOperator[] = [];
for (const obj of Object.values(WHERE_CLAUSE_OPERATORS_CONFIG)) {
  //@ts-ignore
  if (obj.arrayValues) {
    WHERE_CLAUSE_OPERATORS_ARRAY_VALUES.push(<TWhereClauseOperator> obj.type);
  }
}

export const WHERE_CLAUSE_OPERATORS_NO_VALUES: TWhereClauseOperator[] = [];
for (const obj of Object.values(WHERE_CLAUSE_OPERATORS_CONFIG)) {
  //@ts-ignore
  if (obj.noValue) {
    WHERE_CLAUSE_OPERATORS_NO_VALUES.push(<TWhereClauseOperator> obj.type);
  }
}

export type TWhereClauseOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "<>"
  | "LIKE"
  | "ILIKE"
  | "BETWEEN"
  | "NOT BETWEEN"
  | "IN"
  | "NOT IN"
  | "IS NULL"
  | "IS NOT NULL"
  | "IS TRUE"
  | "IS NOT TRUE"
  | "IS FALSE"
  | "IS NOT FALSE"
  | "IS UNKNOWN"
  | "IS NOT UNKNOWN";

export type TPreparedStatement = {
  sql: string;
  values: any[];
};

export type TOrderByDirection = "ASC" | "DESC";

export type TOrderBy = {
  column: string;
  order: TOrderByDirection;
};
