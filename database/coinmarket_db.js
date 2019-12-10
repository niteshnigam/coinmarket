const mysql = require('mysql');

const connect = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "coinmarket",
    name: "string",
    password: "",
    port: "3306"
});

connect.connect(function(err) {
    if (err) throw err;
    console.log("connection establish!")
})

module.exports = connect;