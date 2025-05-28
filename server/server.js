const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API);


async function generateSummary(transcript) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' }); // Use Gemini 2
  const prompt = `Summarize the following YouTube video transcript:\n\n${transcript}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text(); // Ensure correct method usage
  return text;
}

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match ? match[2] : false;
}

app.post('/summarize', async (req, res) => {
  const { youtubeLink } = req.body;
  if (!youtubeLink) {
    return res.status(400).json({ error: 'YouTube link is missing.' });
  }

  try {
    const videoId = extractVideoId(youtubeLink);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptArray.map((item) => item.text).join(' ');

    const summary = await generateSummary(transcript);
    res.json({ summary });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to summarize video.' });
  }
});

app.post('/transcript', async (req, res) => {
  const { youtubeLink } = req.body;
  if (!youtubeLink) {
    return res.status(400).json({ error: 'YouTube link is missing.' });
  }

  try {
    const videoId = extractVideoId(youtubeLink);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptArray.map((item) => item.text).join('\n\n');

    res.json({ transcript });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript.' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
