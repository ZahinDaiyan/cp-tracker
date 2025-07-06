// Import modules
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Used to call Codeforces API

// Create Express app
const app = express();

// Enable CORS (cross-origin) so frontend can access backend
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// In-memory user storage (for testing/demo only)
let users = [];

/**
 * GET /
 * Root test route
 */
app.get("/", (req, res) => {
  res.send("✅ Server is running. CP Tracker backend is alive.");
});

/**
 * POST /api/register
 * Simulated user registration (name + handle)
 */
app.post("/api/register", (req, res) => {
  const { username, handle } = req.body;

  if (!username || !handle) {
    return res.status(400).json({ error: "Username and handle are required." });
  }

  users.push({ username, handle });
  return res.status(201).json({ message: "User registered", data: { username, handle } });
});

/**
 * GET /api/codeforces/:handle
 * Fetch basic user info from Codeforces API
 */
app.get("/api/codeforces/:handle", async (req, res) => {
  const { handle } = req.params;

  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(404).json({ error: "User not found on Codeforces." });
    }

    return res.json(data.result[0]);
  } catch (error) {
    console.error("Error fetching Codeforces user info:", error.message);
    return res.status(500).json({ error: "Failed to fetch Codeforces data." });
  }
});

/**
 * GET /api/codeforces/:handle/solved
 * Fetch list of unique solved problems by the user
 */
app.get("/api/codeforces/:handle/solved", async (req, res) => {
  const handle = req.params.handle;

  try {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(400).json({ error: "Invalid handle or API issue." });
    }

    const solved = data.result.filter(sub => sub.verdict === "OK");

    // Remove duplicates
    const uniqueProblems = new Map();
    solved.forEach(sub => {
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!uniqueProblems.has(key)) {
        uniqueProblems.set(key, {
          name: sub.problem.name,
          contestId: sub.problem.contestId,
          index: sub.problem.index,
          rating: sub.problem.rating || "N/A",
          tags: sub.problem.tags || []
        });
      }
    });

    return res.json({
      handle: handle,
      solvedCount: uniqueProblems.size,
      problems: Array.from(uniqueProblems.values())
    });

  } catch (error) {
    console.error("Error fetching solved problems:", error.message);
    res.status(500).json({ error: "Something went wrong while fetching problems." });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
