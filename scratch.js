let DatabaseConnection = require('./lib/service/database-connection').default;
let DatabaseConfiguration = require("./lib/model/database-configuration").default;

var config = new DatabaseConfiguration("localhost", 3306, 'testing', "root", "root", "mysql");
DatabaseConnection.connect(config).then(function (dbConn) {
    var Foo = dbConn.defineModel();
    Foo.sync({force: true}).then(function () {
        Foo.create({
            firstname: 'John',
            lastname: 'Hancock'
        });
    })

}, (err) => {
    console.log("##############################" + err.name);
});


