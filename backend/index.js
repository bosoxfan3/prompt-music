const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const OpenAI = require('openai');
require('dotenv').config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:3000',
    'https://prompt-music.vercel.app',
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // allows cookies to be sent
    })
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Check if there is a valid token or refresh token to continously keep users authenticated
async function getValidAccessToken(req, res) {
    let accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (accessToken) {
        try {
            const testRes = await fetch('https://api.spotify.com/v1/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (testRes.status !== 401) {
                return accessToken; // Token is still valid
            }
        } catch (err) {
            console.error('Error testing access token:', err);
            return null;
        }
    }

    if (refreshToken) {
        try {
            const refreshRes = await fetch(
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
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken,
                    }),
                }
            );

            const data = await refreshRes.json();

            if (!data.access_token) {
                console.log('Refresh failed: No new access token returned.');
                return null;
            }

            res.cookie('access_token', data.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            });

            return data.access_token;
        } catch (err) {
            console.error('Error refreshing token:', err);
            return null;
        }
    }

    return null;
}

app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Fetch Spotify user so we know if they're logged in, as well as have their id and username for playlist saving
app.get('/user', async (req, res) => {
    const accessToken = await getValidAccessToken(req, res);
    if (!accessToken) {
        res.json({ user: null });
    }

    try {
        const userProfileRes = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userProfileRes.ok) {
            return res.status(400).json({ error: 'Failed to fetch profile' });
        }

        const user = await userProfileRes.json();
        res.json({ user });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/login', (req, res) => {
    const authURL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${SPOTIFY_REDIRECT_URI}&scope=playlist-modify-private`;
    res.redirect(authURL); // This should redirect to Spotify's login page
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('No code received');
    }

    try {
        // Try the token exchange using the code
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
                    code,
                    redirect_uri: SPOTIFY_REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            }
        );

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

        // If we've got a token, fetch the user data from Spotify
        const userProfileResponse = await fetch(
            'https://api.spotify.com/v1/me',
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            }
        );

        const userProfile = await userProfileResponse.json();

        // Finish Spotify authorization, set the cookies, and send them back to this app
        res.cookie('access_token', tokenData.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        res.cookie('refresh_token', tokenData.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        res.cookie('spotify_user_id', userProfile.id, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });

        res.redirect(FRONTEND_BASE_URL);
    } catch (err) {
        console.error('Error during token exchange:', err);
        res.status(500).send('Error during token exchange');
    }
});

// Send prompt to ChatGPT to generate playlist, then fetch songs in playlist from Spotify
app.post('/playlist', async (req, res) => {
    const accessToken = await getValidAccessToken(req, res);
    const { prompt } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: `You are a music curator. Based on the vibe "${prompt}", return a playlist of 10 songs as a JSON array with each song as { "title": "", "artist": "", uri: null }. Don't repeat artists.`,
                },
            ],
            temperature: 0.8,
        });

        let playlist;
        try {
            playlist = JSON.parse(
                completion.choices[0].message.content || '[]'
            );
        } catch (parseErr) {
            console.error('Failed to parse OpenAI response:', parseErr);
            return res
                .status(500)
                .send({ error: 'Failed to parse OpenAI response' });
        }

        if (!accessToken) {
            return res.send({ playlist });
        }

        // If the user is logged in, we need to add the uris from Spotify to the songs so that the playlist can be saved
        const results = [];
        for (const song of playlist) {
            const query = `track:${song.title} artist:${song.artist}`;
            const spotifyRes = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                    query
                )}&type=track&limit=1`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const data = await spotifyRes.json();
            const track = data?.tracks?.items?.[0];
            const images = track?.album?.images || [];
            const thumbnailUrl = images.length
                ? images[images.length - 1].url
                : null;

            if (track) {
                results.push({
                    title: song.title,
                    artist: song.artist,
                    uri: track?.uri || null,
                    thumbnail: thumbnailUrl,
                });
            }
        }
        res.send({ playlist: results });
    } catch (err) {
        console.error('OpenAI or Spotify error:', err);
        res.status(500).send({ error: 'Something went wrong' });
    }
});

// If user is authenticated and playlist songs have uris, save playlist to Spotify and open Spotify
app.post('/save-playlist', async (req, res) => {
    const accessToken = await getValidAccessToken(req, res);
    const { userId, playlistName, tracks } = req.body;

    if (!accessToken || !userId || !playlistName || !tracks) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // We can only save songs with Spotify uris
    const filteredTracks = tracks.filter((song) => song.uri);
    let playlistToUse = filteredTracks;

    // Double check for uris from Spotify if none of the songs had one
    if (!playlistToUse.length) {
        playlistToUse = [];
        for (const song of tracks) {
            const query = `track:${song.title} artist:${song.artist}`;
            const spotifyRes = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                    query
                )}&type=track&limit=1`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const data = await spotifyRes.json();
            const track = data?.tracks?.items?.[0];
            const images = track.album.images;
            const thumbnailUrl = images.length
                ? images[images.length - 1].url
                : null;

            if (track) {
                playlistToUse.push({
                    title: song.title,
                    artist: song.artist,
                    uri: track?.uri || null,
                    thumbnail: thumbnailUrl,
                });
            }
        }
        playlistToUse = playlistToUse.filter((song) => song.uri);
    }

    try {
        // Create playlist
        const createRes = await fetch(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: 'Generated by Prompt Music',
                    public: false,
                }),
            }
        );

        const playlist = await createRes.json();
        if (!playlist.id) throw new Error('Failed to create playlist');

        const trackUris = playlistToUse
            .map((track) => track.uri)
            .filter(Boolean);

        // Add tracks
        await fetch(
            `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uris: trackUris }),
            }
        );

        res.status(200).json({
            success: true,
            playlistUrl: playlist.external_urls.spotify,
        });
    } catch (err) {
        console.error('Error creating playlist:', err);
        res.status(500).json({ error: 'Could not create playlist' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
