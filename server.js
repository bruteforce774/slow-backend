const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

/**
 * Health check
 * GET /health
 */
app.get("/health", async (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
  });
});

/**
 * Fetch posts from an external API
 * GET /posts
 */
app.get("/posts", async (req, res) => {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    // Keep the response small and readable
    const posts = response.data.slice(0, 5).map(post => ({
      id: post.id,
      title: post.title,
    }));

    res.json(posts);
  } catch (error) {
    console.error("Axios error:", error.message);

    res.status(500).json({
      error: "Failed to fetch posts from external API",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
