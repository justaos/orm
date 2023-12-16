import {
  DatabaseOperationContext,
  DataType,
  NATIVE_DATA_TYPES,
  RawRecord
} from "../mod.ts";
import getORM from "./getORM.ts";
import TableSchema from "../src/table/TableSchema.ts";
import { ColumnDefinition } from "../src/table/definitions/ColumnDefinition.ts";

const odm = getORM();
const conn = await odm.connect(true);

try {
  odm.addDataType(
    class extends DataType {
      constructor() {
        super(NATIVE_DATA_TYPES.VARCHAR);
      }

      getName() {
        return "email";
      }

      async validateValue(
        _schema: TableSchema,
        fieldName: string,
        record: RawRecord
      ) {
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
        record: RawRecord,
        _context: DatabaseOperationContext
      ) {
        return record[fieldName];
      }
    }
  );

  await conn.defineTable({
    name: "student",
    columns: [
      {
        name: "name",
        type: "string"
      },
      {
        name: "personal_contact",
        type: "email"
      },
      {
        name: "emp_no",
        type: "uuid"
      },
      {
        name: "salary",
        type: "integer"
      },
      {
        name: "birth_date",
        type: "date"
      },
      {
        name: "gender",
        type: "boolean"
      }
    ]
  });

  const studentTable = conn.table("student");
  const student = studentTable.createNewRecord();
  student.set("personal_contact", "test");
  student.set("birth_date", new Date());
  try {
    await student.insert();
    console.log("Student created");
  } catch (_error) {
    console.log(_error.toJSON());
  }
} catch (_error) {
  console.log(_error, "connection failed");
} finally {
  await conn.closeConnection();
}
