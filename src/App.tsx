import React, { useState, useEffect } from 'react';
import './App.css';

import LoadingSpinnerModal from './components/loading-spinner-modal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
    const [inputValue, setInputValue] = useState<string>('');
    const [lastFetchedInput, setLastFetchedInput] = useState<string>('');
    const [playlist, setPlaylist] = useState<
        { title: string; artist: string }[]
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [spotifyUser, setSpotifyUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('spotify_access_token');
        const expiresAt = Number(
            localStorage.getItem('spotify_token_expires_at')
        );

        if (token && Date.now() < expiresAt) {
            // Token is valid, fetch the user's Spotify profile
            fetch('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('Spotify user profile:', data);
                    setSpotifyUser(data);
                    // Optionally: store in state
                })
                .catch((err) => {
                    console.error('Error fetching profile:', err);
                });
        } else {
            console.log(
                'No valid token found, user needs to login with Spotify'
            );
        }
    }, []);

    const getPlaylist = async () => {
        if (!inputValue) return;

        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/playlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: inputValue }),
            });

            const data = await res.json();

            if (data.playlist) {
                const songs = JSON.parse(data.playlist); // Still parse because GPT returns text
                setPlaylist(songs);
                setLastFetchedInput(inputValue);
                setInputValue('');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    return (
        <div className="app">
            <div className="container">
                <h1>
                    Talk about...
                    <a
                        className="title-link"
                        href="https://www.youtube.com/watch?v=gPoiv0sZ4s4"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Pop Music
                    </a>
                </h1>
                <h3>(Or really any kind of music!)</h3>
                <h4>
                    Enter a mood, scenario, or just a combination of adjectives
                    and generate a custom 10-song playlist
                </h4>
                <input
                    type="text"
                    placeholder="ex. studying during a thunderstorm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                {spotifyUser ? (
                    <p>Welcome, {spotifyUser.display_name}</p>
                ) : (
                    <a href="https://prompt-music-production.up.railway.app/login">
                        Connect to Spotify
                    </a>
                )}
                <button type="button" onClick={getPlaylist}>
                    Generate Playlist
                </button>
                {isLoading && <LoadingSpinnerModal />}
                {!!playlist.length && (
                    <>
                        <p>Built off of: "{lastFetchedInput}"</p>
                        {playlist.map((song) => (
                            <div key={song.title}>
                                <p>
                                    {song.title} - {song.artist}
                                </p>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
