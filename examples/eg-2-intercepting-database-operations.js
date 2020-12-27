
const getODM = require("./getODM");

getODM().then(function (odm) {

    odm.addInterceptor({

        getName: function () {
            return "my-intercept";
        },

        intercept: (collectionName, operation, when, payload) => {
            return new Promise((resolve, reject) => {
                if (collectionName === 'student') {
                    if (operation === 'CREATE') {
                        console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                        if (when === "BEFORE") {
                            for (let record of payload.records) {
                                console.log("computed field updated for :: " + record.get('name'));
                                record.set("computed", record.get("name") + " +++ computed");
                            }
                        }
                    }
                    if (operation === 'READ') {
                        console.log("[collectionName=" + collectionName + ", operation=" + operation + ", when=" + when + "]");
                        if (when === "AFTER") {
                            for (let record of payload.records)
                                console.log(JSON.stringify(record.toObject(), null, 4));
                        }
                    }
                }
                resolve(payload);
            });
        }
    });

    odm.defineCollection({
        name: 'student',
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: 'computed',
            type: 'string'
        }]
    });

    let studentCollection = odm.collection("student");
    let s = studentCollection.createNewRecord();
    s.set("name", "John " + new Date().toISOString());
    s.insert().then(function () {
        studentCollection.find().toArray().then(function (students) {
            odm.closeConnection();
        });
    });

});
