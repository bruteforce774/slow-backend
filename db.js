import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Ensure env vars are loaded BEFORE creating the pool
dotenv.config({ path: new URL("./.env", import.meta.url) });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
