import { FieldType, ODM, PrimitiveDataType, Schema } from "../mod.ts";

const odm = new ODM();

try {
  await odm.connect("mongodb://127.0.0.1:27017/collection-service");
  console.log("connection success");

  odm.addFieldType(
    class extends FieldType {
      constructor(odm: ODM) {
        super(odm, PrimitiveDataType.STRING);
      }

      getName() {
        return "email";
      }

      async validateValue(
        schema: Schema,
        fieldName: string,
        record: any,
        context: any
      ) {
        const pattern = "(.+)@(.+){2,}\\.(.+){2,}";
        if (!new RegExp(pattern).test(record[fieldName])) {
          throw new Error("Not a valid email");
        }
      }

      validateDefinition(fieldDefinition: any) {
        return !!fieldDefinition.name;
      }

      async getDisplayValue(schema: Schema, fieldName: string, record: any) {
        return record[fieldName];
      }

      setValueIntercept(schema: Schema, fieldName: string, newValue: any): any {
        return newValue;
      }
    }
  );

  odm.defineCollection({
    label: "Student",
    name: "student",
    fields: [
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
        type: "objectId"
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
      },
      {
        name: "address",
        type: "object"
      }
    ]
  });

  const studentCollection = odm.collection("student");
  const studentRecord = studentCollection.createNewRecord();
  studentRecord.set("personal_contact", "test");
  studentRecord.set("birth_date", new Date());
  try {
    await studentRecord.insert();
    console.log("Student created");
  } catch (_error) {
    console.log(_error.toJSON());
  }

} catch (_error) {
  console.log(_error, "connection failed");
} finally {
  await odm.closeConnection();
}
