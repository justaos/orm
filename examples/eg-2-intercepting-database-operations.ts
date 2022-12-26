import getODM from "./getODM.ts";
import {
  OperationInterceptorInterface,
  OperationType,
  OperationWhen,
  Record,
} from "../mod.ts";

const odm = await getODM();

odm.addInterceptor(
  new (class extends OperationInterceptorInterface {
    getName() {
      return "my-intercept";
    }

    async intercept(
      collectionName: string,
      operation: OperationType,
      when: OperationWhen,
      records: Record[],
      context: any,
    ) {
      if (collectionName === "student") {
        if (operation === "CREATE") {
          console.log(
            "[collectionName=" +
              collectionName +
              ", operation=" +
              operation +
              ", when=" +
              when +
              "]",
          );
          if (when === "BEFORE") {
            for (let record of records) {
              console.log(
                "computed field updated for :: " + record.get("name"),
              );
              record.set("computed", record.get("name") + " +++ computed");
            }
          }
        }
        if (operation === "READ") {
          console.log(
            "[collectionName=" +
              collectionName +
              ", operation=" +
              operation +
              ", when=" +
              when +
              "]",
          );
          if (when === "AFTER") {
            for (const record of records) {
              console.log(JSON.stringify(record.toObject(), null, 4));
            }
          }
        }
      }
      return records;
    }
  })(),
);

odm.defineCollection({
  name: "student",
  fields: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "computed",
      type: "string",
    },
  ],
});

const studentCollection = odm.collection("student");
const studentRecord = studentCollection.createNewRecord();
studentRecord.set("name", "John " + new Date().toISOString());
studentRecord.insert().then(function () {
  studentCollection
    .find()
    .toArray()
    .then(function () {
      odm.closeConnection();
    });
});
