import mysql from "mysql2/promise";

export const conn = mysql.createPool({
  connectionLimit: 10,
  host: "202.28.34.203",
  user: "mb68_66011212252",
  password: "UVwA@%5rlrJt",
  database: "mb68_66011212252",
  waitForConnections: true,
  queueLimit: 0,


});
console.log("MySQL pool created:", conn ? true : false);
