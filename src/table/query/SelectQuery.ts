import RecordQuery from "./RecordQuery.ts";
import Record from "../../record/Record.ts";
import { OPERATION_TYPES, OPERATION_WHENS } from "../../constants.ts";
import Table from "../Table.ts";
import { Logger } from "https://deno.land/x/justaos_utils@v1.6.0/packages/logger-utils/mod.ts";
import { NativeSQL } from "../../core/NativeSQL.ts";
import { RawRecord } from "../../record/RawRecord.ts";

export default class SelectQuery extends RecordQuery {
  readonly #logger = Logger.createLogger({ label: SelectQuery.name });
  #columns: string[] = ["*"];

  #where: any[] = [];

  #limit: number | undefined;

  #sql: NativeSQL;

  constructor(table: Table, sql: NativeSQL) {
    super(table);
    this.#sql = sql;
  }

  getSelectedColumns(): string[] | undefined {
    if (this.#columns.length >= 1 && this.#columns[0] !== "*") {
      return this.#columns;
    }
  }

  columns(...args: string[]): SelectQuery {
    if (args.length === 0) {
      this.#columns = ["*"];
    } else if (args.length === 1 && Array.isArray(args[0])) {
      this.#columns = args[0];
    } else if (args.length === 1 && typeof args[0] === "object") {
      this.#columns = Object.keys(args[0]);
    } else {
      this.#columns = args.map((arg) => {
        if (typeof arg === "object") {
          throw new Error("Invalid argument");
        }
        return arg;
      });
    }
    return this;
  }

  where(column: any, operator: any, value: any): SelectQuery {
    // Support "where true || where false"
    if (column === false || column === true) {
      return this.where(1, "=", column ? 1 : 0);
    }
    if (arguments.length === 2) {
      return this.where(column, "=", operator);
    }

    this.#where.push({
      column,
      operator,
      value
    });

    return this;
  }

  limit(limit: number): SelectQuery {
    this.#limit = limit;
    return this;
  }

  async getCount(): Promise<number> {
    const reserve = await this.#sql.reserve();

    const schemaName = this.getTable().getSchemaName();
    const tableName = this.getTable().getName();

    let query = `SELECT COUNT(*) as count FROM ${schemaName}.${tableName}`;
    if (this.#limit) {
      query = query + ` LIMIT ${this.#limit}`;
    }
    this.#logger.info(`[Query] ${query}`);

    const rawRecords: RawRecord[] = await reserve.unsafe(query);
    reserve.release();
    return rawRecords[0]["count"];
  }

  async execute(returnRecords = false): Promise<Record[]> {
    const reserve = await this.#sql.reserve();

    const schemaName = this.getTable().getSchemaName();
    const tableName = this.getTable().getName();

    let query = `SELECT ${this.#columns} FROM ${schemaName}.${tableName}`;
    if (this.#where.length > 0) {
      query = query + " WHERE ";
      query =
        query +
        this.#where
          .map((where) => {
            return `${where.column} ${where.operator} '${where.value}'`;
          })
          .join(" AND ");
    }
    if (this.#limit) {
      query = query + ` LIMIT ${this.#limit}`;
    }
    this.#logger.info(`[Query] ${query}`);

    if (returnRecords) {
      const rawRecords: RawRecord[] = await reserve.unsafe(query);
      reserve.release();
      await this.getTable().intercept(
        OPERATION_TYPES.READ,
        OPERATION_WHENS.BEFORE,
        []
      );
      const records = this.getTable().convertRawRecordsToRecords(rawRecords);
      await this.getTable().intercept(
        OPERATION_TYPES.READ,
        OPERATION_WHENS.AFTER,
        records
      );
      return records;
    } else {
      /* const cursor = await reserve.unsafe(query).cursor();
       reserve.release();*/
      return [];
    }
  }
}
