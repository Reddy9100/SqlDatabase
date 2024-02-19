const Mysql = require("mysql")



const connection = Mysql.createConnection({
    host : "localhost",
    database: "sql_task",
    user : "root",
    password : "root123"
})

module.exports = connection;