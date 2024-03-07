require('dotenv').config()
const Mysql = require("mysql2/promise")

const user = process.env.USER_NAME;
// console.log(user)
const password = process.env.PASSWORD;
// console.log(password)
const host = process.env.HOST;
const database = process.env.DATABASE;

const pool =Mysql.createPool({
    host : host,
    database :database,
    user:user,
    password:password
})

module.exports = pool