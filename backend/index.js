const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config({ path: './backend/.env' });

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

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

app.get('/login', (req, res) => {
    const scope = 'playlist-modify-private playlist-modify-public';

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('No code received');
    }

    // Make the POST request to Spotify to exchange the code for an access token
    const tokenResponse = await fetch(
        'https://accounts.spotify.com/api/token',
        {
            method: 'POST',
            headers: {
                Authorization:
                    'Basic ' +
                    Buffer.from(clientId + ':' + clientSecret).toString(
                        'base64'
                    ),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
        return res
            .status(400)
            .send('Error getting tokens: ' + tokenData.error_description);
    }

    // You can now store the access token securely (e.g., in a session or cookie)
    // For now, let's just send the access token as a response (this is temporary)
    res.json(tokenData);
});

app.get('/', (req, res) => {
    res.send('Backend is working!');
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
