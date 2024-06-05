import { afterAll, assert, beforeAll, describe, it } from "../../test_deps.ts";

import {
  type ColumnDefinition,
  DataType,
  type ORM,
  type ORMConnection,
} from "../../mod.ts";
import { Session } from "../test.utils.ts";

describe({
  name: "Custom FieldType",
  fn: () => {
    let odm: ORM;
    let conn: ORMConnection;
    const cleanTableList: string[] = [];
    const logger = Session.getLogger();

    const MODEL_NAME = "field_definition_test";
    const EMAIL_TYPE = "email";
    const EMAIL_FIELD = "email";
    const EMAIL_VALUE = "test@example.com";

    beforeAll(async () => {
      conn = await Session.getConnection();
      odm = Session.getORM();
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
          super("email", "VARCHAR");
        }

        toJSONValue(value: string | null): string | null {
          return value;
        }

        validateDefinition(fieldDefinition: ColumnDefinition) {
          return true;
        }

        setValueIntercept(newValue: any): any {
          return newValue;
        }

        async validateValue(value: unknown): Promise<void> {
          const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
          if (
            value &&
            typeof value === "string" &&
            !new RegExp(pattern).test(value)
          ) {
            throw new Error("Not a valid email");
          }
        }
      }

      odm.addDataType(new EmailType());

      try {
        await conn.defineTable({
          name: MODEL_NAME,
          columns: [
            {
              name: "name",
              type: "string",
            },
            {
              name: EMAIL_FIELD,
              type: EMAIL_TYPE,
            },
          ],
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
        "Record created as expected",
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
              type: "string",
            },
            {
              name: "custom_field",
              type: "invalid_field_type",
            },
          ],
        });
      } catch (_err) {
        // No need to do anything
        error = true;
      }
      assert(error, "Able to create, not defined field type element");
    });
  },
});
