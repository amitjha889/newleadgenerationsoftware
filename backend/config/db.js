import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10, 
});

(async () => {
  try {
    const res = await pool.query("SELECT 1+1 AS result");
    console.log("PostgreSQL Connected:", res.rows[0].result === 2 ? "OK" : "FAIL");
  } catch (error) {
    console.error("PostgreSQL Connection Error:", error.message);
  }
})();
