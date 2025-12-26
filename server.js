import express from "express";
import axios from "axios";
import dotenv from "dotenv";

import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", async (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Step 2: Axios route
app.get("/posts", async (req, res) => {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    const posts = response.data.slice(0, 5).map(p => ({
      id: p.id,
      title: p.title,
    }));

    res.json(posts);
  } catch (err) {
    console.error("Axios error:", err.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Step 3: MySQL test route
app.get("/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ db: rows[0] });
  } catch (err) {
    console.error("DB error:", err); // <-- log full error
    res.status(500).json({
      error: "Database connection/query failed",
      message: err.message,
      code: err.code,
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
