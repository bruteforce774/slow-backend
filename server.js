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

// new GET route
app.get("/notes", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, created_at FROM notes ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /notes DB error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// new POST route
app.post("/notes", async (req, res) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "title is required" });
    }

    const cleanTitle = title.trim();

    const [result] = await pool.query(
      "INSERT INTO notes (title) VALUES (?)",
      [cleanTitle]
    );

    res.status(201).json({ id: result.insertId, title: cleanTitle });
  } catch (err) {
    console.error("POST /notes DB error:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

app.get("/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ db: rows[0] });
  } catch (err) {
    console.error("DB error:", err);
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
