import getODM from "./getODM.ts";
import { FieldType, ODM, PrimitiveDataType, Schema } from "../mod.ts";

const odm = await getODM();

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
      context: any,
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
  },
);

odm.defineCollection({
  label: "Student",
  name: "student",
  fields: [
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
      type: "objectId",
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
    {
      name: "address",
      type: "object",
    },
  ],
});

const studentCollection = odm.collection("student");
const studentRecord = studentCollection.createNewRecord();
studentRecord.set("personal_contact", "test");
studentRecord.set("birth_date", new Date());
studentRecord.insert().then(
  function () {
    console.log("Student created");
  },
  (err) => {
    console.log(err.toJSON());
    odm.closeConnection().then(function () {
      console.log("Connection closed");
    });
  },
);
