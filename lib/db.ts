import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "charisword",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "chariswordKnust",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool
