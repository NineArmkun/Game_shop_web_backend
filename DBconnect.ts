import mysql = require("mysql2");

export const conn = mysql.createConnection({
  connectionLimit: 10,
  host: "202.28.34.203",
  user: "mb68_66011212013",
  password: "xjY_1gE3I(!Y",
  database: "mb68_66011212013",
  

  
})
conn.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});
