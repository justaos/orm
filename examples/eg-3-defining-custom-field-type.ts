import { ColumnDefinition, DataType } from "../mod.ts";
import getORM from "./getORM.ts";

const odm = getORM();
const conn = await odm.connect(true);

odm.addDataType(
  new (class extends DataType {
    constructor() {
      super("email", "VARCHAR");
    }

    toJSONValue(value: string | null): string | null {
      return value;
    }

    validateDefinition(_columnDefinition: ColumnDefinition) {
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
      )
        throw new Error("Not a valid email");
    }
  })()
);

await conn.defineTable({
  name: "student",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "personal_contact",
      type: "email",
    },
    {
      name: "emp_no",
      type: "uuid",
    },
    {
      name: "salary",
      type: "integer",
    },
    {
      name: "birth_date",
      type: "date",
    },
    {
      name: "gender",
      type: "boolean",
    },
  ],
});

const studentTable = conn.table("student");
const student = studentTable.createNewRecord();
student.set("personal_contact", "test");
student.set("birth_date", new Date());
try {
  await student.insert();
  console.log("Student created");
} catch (error) {
  console.log(error.toJSON());
}

await conn.closeConnection();
