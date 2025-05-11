const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/playlist', async (req, res) => {
    const { prompt } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: `You are a music curator. Based on the vibe "${prompt}", return a playlist of 10 songs as a JSON array with each song as { "title": "", "artist": "" }. Don't repeat artists.`,
                },
            ],
            temperature: 0.8,
        });

        const message = completion.choices[0].message.content;
        res.send({ playlist: message });
    } catch (err) {
        console.error('OpenAI error:', err);
        res.status(500).send({ error: 'Something went wrong with OpenAI' });
    }
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
