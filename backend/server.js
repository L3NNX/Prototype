import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS || "*",
    credentials: false,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
})

// Debug route - check if env vars are loaded
app.get("/debug", (req, res) => {
  res.json({
    hasAppId: !!process.env.ONESIGNAL_APP_ID,
    hasApiKey: !!process.env.ONESIGNAL_API_KEY,
    appIdPreview: process.env.ONESIGNAL_APP_ID 
      ? process.env.ONESIGNAL_APP_ID.substring(0, 8) + "..." 
      : "NOT SET",
    apiKeyPreview: process.env.ONESIGNAL_API_KEY 
      ? process.env.ONESIGNAL_API_KEY.substring(0, 15) + "..." 
      : "NOT SET",
  });
});

app.post("/order", async (req, res) => {
  try {
    const response = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.ONESIGNAL_APP_ID,
          headings: { en: "New Order 🍔" },
          contents: { en: "Order #123 from John Doe" },
          included_segments: ["All"], // prototype shortcut
          url: "https://prototype-xi-virid.vercel.app" 
        }),
      }
    );

    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
app.get("/", (req, res) => {
  res.send("One Signal Prototype.");
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
