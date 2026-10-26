
const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "personal_dash",
});

module.exports = pool;
