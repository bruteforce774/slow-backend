const express = require("express");
const app = express();

app.use(express.json());

app.get("/health", async (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.listen(3000, () => console.log("API running on http://localhost:3000"));
