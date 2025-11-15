import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.NODE_ENV === 'production' 
    ? (process.env.MYSQL_HOST ?? "localhost")
    : (process.env.DB_HOST ?? "localhost"),
  port: Number.parseInt(
    process.env.NODE_ENV === 'production' 
      ? (process.env.MYSQL_PORT ?? "3306")
      : (process.env.DB_PORT ?? "3306")
  ),
  user: process.env.NODE_ENV === 'production' 
    ? (process.env.MYSQL_USER ?? "charisword")
    : (process.env.DB_USER ?? "charisword"),
  password: process.env.NODE_ENV === 'production' 
    ? (process.env.MYSQL_PASSWORD ?? "password")
    : (process.env.DB_PASSWORD ?? "password"),
  database: process.env.NODE_ENV === 'production' 
    ? (process.env.MYSQL_DATABASE ?? "chariswordKnust")
    : (process.env.DB_NAME ?? "chariswordKnust"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
})

export default pool
