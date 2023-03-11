const mysql = require('mysql');
const pool = mysql.createPool({
    host:'localhost',
    // port:3306,
    port:3306,//server
    user:'root',
    // password:'WANG.-1226',
    password:'WANG.-1226',//server
    database:'qiu',
    multipleStatements:true
});
module.exports = pool;