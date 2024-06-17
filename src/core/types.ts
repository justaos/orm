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
