const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config({ path: './backend/.env' });

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

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
    const authURL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${SPOTIFY_REDIRECT_URI}&scope=playlist-modify-public playlist-modify-private`;
    res.redirect(authURL); // This should redirect to Spotify's login page
});

app.get('/callback', async (req, res) => {
    const code = req.query.code; // Extract the code from the query
    console.log('Received code:', code); // Log the code to debug

    if (!code) {
        return res.status(400).send('No code received');
    }

    try {
        // Proceed with the token exchange using the code
        const tokenResponse = await fetch(
            'https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                headers: {
                    Authorization:
                        'Basic ' +
                        Buffer.from(
                            SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
                        ).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code: code,
                    redirect_uri: SPOTIFY_REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            }
        );

        // Check if the response was successful
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            return res
                .status(400)
                .send('Error getting tokens: ' + errorData.error_description);
        }

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return res
                .status(400)
                .send('Error getting tokens: ' + tokenData.error_description);
        }

        localStorage.setItem('spotify_access_token', tokenData.access_token);
        localStorage.setItem(
            'spotify_token_expires_at',
            (Date.now() + tokenData.expires_in * 1000).toString()
        );

        // Now fetch the user's profile using the access token
        const accessToken = tokenData.access_token;

        const userProfileResponse = await fetch(
            'https://api.spotify.com/v1/me',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const userProfile = await userProfileResponse.json();

        // Send the token and user profile back to the client
        res.json({ tokenData, userProfile });
    } catch (err) {
        console.error('Error during token exchange:', err);
        res.status(500).send('Error during token exchange');
    }
});

app.get('/', (req, res) => {
    res.send('Backend is working!');
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
