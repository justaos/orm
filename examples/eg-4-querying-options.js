let getODM = require("./getODM");

getODM().then(async function (odm) {


    odm.defineCollection({
        name: 'teacher',
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: "roll_no",
            type: "integer"
        }]
    });

    let teacherCol = odm.collection("teacher");
    /*for (let i = 0; i < 10; i++) {
        let t = teacherCol.createNewRecord();
        t.set("name", "a");
        t.set("roll_no", i + 1);
        await t.insert();
    }*/

    teacherCol.find({}, {sort: {'roll_no': 1}}).toArray().then(function(records) {
        records.forEach(function(rec){
            console.log(rec.get('name') + " :: " + rec.get('roll_no'));
        });
    });

});
