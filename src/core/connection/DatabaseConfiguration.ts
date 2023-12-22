type DatabaseConfiguration = {
  hostname?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connect_timeout?: number;
  max_connections?: number;
};

export type { DatabaseConfiguration };
