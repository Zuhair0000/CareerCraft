require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => console.log("Connected to Supabase"))
  .catch(console.log("Database connection error"));

module.exports = pool;
