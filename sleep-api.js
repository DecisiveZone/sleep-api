const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3100;

// Enable public access
app.use(express.json());
app.use(cors());

// Sleep function (returns a Promise)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// File logging utility
const logToFile = (content) => {
  const logsDir = path.join(__dirname, "logs");
  const logPath = path.join(logsDir, "sleep.log");
  const timestamp = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    hour12: false,
  });

  const logMessage = `[${timestamp}] ${content}\n`;

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  fs.appendFile(logPath, logMessage, (err) => {
    if (err) console.error("❌ Error writing log:", err);
  });
};

// /sleep endpoint
app.get("/sleep", async (req, res) => {
  const seconds = parseInt(req.query.seconds);

  if (isNaN(seconds) || seconds <= 0 || seconds > 300) {
    logToFile(`❗ Invalid sleep request: "${req.query.seconds}"`);
    return res.status(400).json({
      status: "error",
      message: 'Invalid input. "seconds" must be a number between 1 and 300.',
    });
  }

  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  logToFile(`Sleep requested: ${seconds}s from ${clientIP}`);

  await sleep(seconds * 1000);

  res.json({
    status: "success",
    message: `Paused for ${seconds} second(s)`,
  });
});

// Health check route
app.get("/", (req, res) => {
  res.send("🟢 Sleep API is active.");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Sleep API running at http://localhost:${PORT}`);
});
