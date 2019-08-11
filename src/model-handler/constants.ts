import * as mongoose from "mongoose";

export const FIELDS_TYPES = {
    STRING: 'string',
    INTEGER: 'integer',
    ID: 'id',
    BOOLEAN: 'boolean',
    REFERENCE: 'reference',
    DATE: 'date'
};

export const MONGOOSE_TYPES = {
    STRING: mongoose.Schema.Types.String,
    NUMBER: mongoose.Schema.Types.Number,
    OBJECTID: mongoose.Schema.Types.ObjectId,
    BOOLEAN: mongoose.Schema.Types.Boolean,
    DATE: mongoose.Schema.Types.Date
};
