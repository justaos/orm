import Schema from "../collection/Schema";
import ODM from "../ODM";
import Field from "../collection/Field";

export default class FieldTypeUtils {
    static requiredValidation(schema: Schema, field: Field, record: any) {
        if (field.getDefinition().required && (record[field.getName()] === null || record[field.getName()] === ""))
            throw new Error("REQUIRED");
    }

    static async uniqueValidation(odm: ODM | undefined, schema: Schema, field: Field, record: any){
        const value = record[field.getName()];
        if (!odm)
            throw new Error("ODM required for unique check");
        if (field.getDefinition().unique && value !== null) {
            const collection = odm.collection(schema.getName());
            const condition = {[field.getName()]: value};
            if (record._id)
                condition._id = {$ne: record._id};
            const rec = await collection.findOne(condition);
            if (rec)
                throw new Error("NOT_UNIQUE");
        }
    }
}

