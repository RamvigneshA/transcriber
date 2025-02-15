const express = require("express");
const cors = require("cors");
const { YoutubeTranscript } = require("youtube-transcript");
// hello
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/transcript", async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ error: "Missing videoId parameter" });
    }

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const text = transcript.map((entry) => entry.text).join(" ");
        res.json({ videoId, transcript: text });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch transcript", details: error.message });
    }
});

// Start the server (needed for Render.com)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
