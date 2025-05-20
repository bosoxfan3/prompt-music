# Prompt-to-Playlist 🎵

Generate Spotify playlists based on a custom mood or scenario using AI and the Spotify API.

## 🚀 Live Demo

[https://prompt-music.vercel.app](https://prompt-music.vercel.app)

## 🧠 How It Works

Users enter a prompt (like "studying during a thunderstorm"), and the app uses OpenAI to generate relevant song recommendations, then pulls matching tracks using the Spotify API. If a user authorizes the app to access their Spotify, they can also save a playlist to their account!

## 🔧 Built With

-   React
-   OpenAI API
-   Spotify Web API
-   Emotion.js

## 📦 Getting Started

1. Clone the repo
2. Run `npm install`
3. You'll need valid credentials from [OpenAI](https://platform.openai.com/docs/overview) and [Spotify](https://developer.spotify.com/dashboard). Once you have those, add an `.env` file with:

```
REACT_APP_API_BASE_URL=http://localhost:8080
OPENAI_API_KEY=your-open-ai-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=https://prompt-music-production.up.railway.app/callback
FRONTEND_BASE_URL=https://prompt-music.vercel.app
```

4. Run `npm start`

## ✍️ Author

Built by [Daniel Acquesta](https://danielacquesta.dev)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
