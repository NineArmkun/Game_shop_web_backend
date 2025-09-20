import mysql from "mysql2/promise";

export const conn = mysql.createPool({
  connectionLimit: 20,
  host: "202.28.34.203",
  user: "mb68_66011212013",
  password: "xjY_1gE3I(!Y",
  database: "mb68_66011212013",
  waitForConnections: true,
  queueLimit: 0,


});
console.log("MySQL pool created:", conn ? true : false);
