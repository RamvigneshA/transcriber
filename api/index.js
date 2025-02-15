require('dotenv').config();
const express = require("express");
const cors = require("cors");
const getSubtitles = require('youtube-captions-scraper').getSubtitles;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/transcript", async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ error: "Missing videoId parameter" });
    }

    try {
        const captions = await getSubtitles({
          videoID: videoId,
          lang: 'en', // get English captions
        });
        
        const text = captions.map((caption) => caption.text).join(' ');
        res.json({
          videoId,
          transcript: text,
          segments: captions, // including the timestamped segments
        });
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
