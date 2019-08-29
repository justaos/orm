let getAnysolsODM = require("./getAnysolsODM");

getAnysolsODM().then(function (anysolsODM) {

    anysolsODM.addInterceptor({

        getName: function () {
            return "my-intercept";
        },

        intercept: (collectionName, operation, when, payload) => {
            return new Promise((resolve, reject) => {
                if (collectionName === 'student') {
                    if (operation === 'create') {
                        console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                        if (when === "before") {
                            for (let record of payload.records) {
                                console.log("computed field updated for :: " + record.get('name'));
                                record.set("computed", record.get("name") + " +++ computed");
                            }
                        }
                    }
                    if (operation === 'read') {
                        console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                        if (when === "after") {
                            for (let record of payload.records)
                                console.log(JSON.stringify(record.toObject(), null, 4));
                        }
                    }
                }
                resolve(payload);
            });
        }
    });

    anysolsODM.defineCollection({
        name: 'student',
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: 'computed',
            type: 'string'
        }]
    });

    let studentCollection = anysolsODM.collection("student");
    let s = studentCollection.createNewRecord();
    s.set("name", "John " + new Date().toISOString());
    s.insert().then(function () {
        studentCollection.find().toArray().then(function (students) {
            anysolsODM.closeConnection();
        });
    });

});
