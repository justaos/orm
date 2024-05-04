type DatabaseConfiguration = {
  hostname?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  max_connections?: number;
  connect_timeout?: number;
};

export type { DatabaseConfiguration };
