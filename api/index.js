require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { google } = require('googleapis');

const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY; // You'll need to set this in your environment variables

// Verify API key is loaded
console.log('API Key loaded:', !!process.env.YOUTUBE_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/transcript", async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ error: "Missing videoId parameter" });
    }

    try {
        const response = await youtube.captions.list({
          key: API_KEY,
          part: 'snippet',
          videoId: videoId,
        });

        if (response.data.items && response.data.items.length > 0) {
          const captionId = response.data.items[0].id;
          const transcript = await youtube.captions.download({
            key: API_KEY,
            id: captionId,
          });

          res.json({
            videoId,
            transcript: transcript.data,
          });
        } else {
          throw new Error('No captions found for this video');
        }
    } catch (error) {
        res.status(500).json({
          error: 'Failed to fetch transcript',
          details: error.message,
        });
    }
});

// Add this route to test API key
app.get("/api/test", (req, res) => {
    res.json({
        apiKeyExists: !!process.env.YOUTUBE_API_KEY,
        apiKeyFirstChars: process.env.YOUTUBE_API_KEY ? 
            `${process.env.YOUTUBE_API_KEY.substr(0, 50)}...` : 
            'not found'
    });
});

// Start the server (needed for Render.com)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
