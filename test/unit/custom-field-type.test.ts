import { afterAll, assert, beforeAll, describe, it } from "../test.deps.ts";

import {
  DatabaseOperationContext,
  DataType,
  NATIVE_DATA_TYPES,
  ODM,
  ODMConnection,
  RawRecord
} from "../../mod.ts";
import { Session } from "../test.utils.ts";
import { Logger } from "../../deps.ts";
import TableSchema from "../../src/table/TableSchema.ts";
import { ColumnDefinition } from "../../src/table/definitions/ColumnDefinition.ts";

const logger = Logger.createLogger({ label: "FieldType" });

describe(
  "custom-field-type",
  {
    sanitizeResources: false,
    sanitizeOps: false
  },
  () => {
    let odm: ODM;
    let conn: ODMConnection;
    const cleanTableList: string[] = [];

    const MODEL_NAME = "field_definition_test";
    const EMAIL_TYPE = "email";
    const EMAIL_FIELD = "email";
    const EMAIL_VALUE = "test@example.com";

    beforeAll(async () => {
      conn = await Session.getConnection();
      odm = Session.getODM();
    });

    afterAll(async () => {
      const conn = await Session.getConnection();
      for (const table of cleanTableList) {
        await conn.dropTable(table);
      }
      await conn.closeConnection();
    });

    it("#addDataType - Registering Custom data type", async function () {
      class EmailType extends DataType {
        constructor() {
          super(NATIVE_DATA_TYPES.VARCHAR);
        }

        getName() {
          return "email";
        }

        async validateValue(_schema: TableSchema, fieldName: string, record: RawRecord) {
          const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
          if (!new RegExp(pattern).test(record[fieldName]))
            throw new Error("Not a valid email");
        }

        validateDefinition(fieldDefinition: ColumnDefinition) {
          return !!fieldDefinition.name;
        }

        getValueIntercept(
          _schema: TableSchema,
          fieldName: string,
          record: RawRecord
        ): any {
          return record[fieldName];
        }

        setValueIntercept(
          _schema: TableSchema,
          _fieldName: string,
          newValue: any,
          _record: RawRecord
        ): any {
          return newValue;
        }

        async getDisplayValue(
          _schema: TableSchema,
          fieldName: string,
          record: any,
          _context: DatabaseOperationContext
        ) {
          return record[fieldName];
        }
      }

      odm.addDataType(new EmailType());

      try {
        await conn.defineTable({
          name: MODEL_NAME,
          columns: [
            {
              name: "name",
              type: "string"
            },
            {
              name: EMAIL_FIELD,
              type: EMAIL_TYPE
            }
          ]
        });
        cleanTableList.push(MODEL_NAME);
        assert(true, "Custom field defined as expected");
      } catch (err) {
        console.error(err);
        assert(false, "Custom field not defined as expected");
      }
    });

    it("#registerFieldType -  creating record with custom field type", async () => {
      const collection = conn.table(MODEL_NAME);
      const rec = collection.createNewRecord();
      rec.set("name", "RAM");
      rec.set(EMAIL_FIELD, EMAIL_VALUE);
      await rec.insert();

      const records = await collection
        .select()
        .where(EMAIL_FIELD, "=", EMAIL_VALUE)
        .toArray();

      assert(
        records.length && records[0].get(EMAIL_FIELD) === EMAIL_VALUE,
        "Record created as expected"
      );
    });

    it("#registerFieldType -  creating record with invalid value", async () => {
      let error = false;
      try {
        const collection = conn.table(MODEL_NAME);
        const rec = collection.createNewRecord();
        rec.set("name", "RAM");
        rec.set(EMAIL_FIELD, "TEST");
        await rec.insert();
      } catch (_err) {
        // No need to do anything
        error = true;
      }
      assert(error, "Able to create, invalid value");
    });

    it("#registerFieldType - trying create invalid field", async function () {
      let error = false;
      try {
        await conn.defineTable({
          name: "field_definition_invalid_test",
          columns: [
            {
              name: "name",
              type: "string"
            },
            {
              name: "custom_field",
              type: "invalid_field_type"
            }
          ]
        });
      } catch (_err) {
        // No need to do anything
        error = true;
      }
      assert(error, "Able to create, not defined field type element");
    });
  }
);
