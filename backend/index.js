const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/playlist', async (req, res) => {
    const { prompt } = req.body;

    try {
        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: `You are a music curator. Based on the vibe "${prompt}", return a playlist of 10 songs as a JSON array with each song as { "title": "", "artist": "" }. Don't repeat artists.`,
                },
            ],
            temperature: 0.8,
        });

        const message = completion.data.choices[0].message.content;
        res.send({ playlist: message });
    } catch (err) {
        console.error('OpenAI error:', err);
        res.status(500).send({ error: 'Something went wrong with OpenAI' });
    }
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
