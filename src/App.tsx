import React, { useState, useEffect } from 'react';
import './App.css';

import LoadingSpinnerModal from './components/loading-spinner-modal';

import Spotify from './components/spotify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
    const [inputValue, setInputValue] = useState<string>('');
    const [lastFetchedInput, setLastFetchedInput] = useState<string>('');
    const [playlist, setPlaylist] = useState<
        { title: string; artist: string; uri: string | null }[]
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [spotifyUser, setSpotifyUser] = useState<any>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                console.log('Fetching user...');
                const res = await fetch(`${API_BASE_URL}/user`, {
                    credentials: 'include', // send cookies
                });
                console.log('User response status:', res.status);
                if (!res.ok) {
                    setSpotifyUser(null);
                    return;
                }
                const data = await res.json();
                setSpotifyUser(data.user);
                const url = new URL(window.location.href);
                url.searchParams.delete('code');
                window.history.replaceState({}, '', url.toString());
            } catch (err) {
                setSpotifyUser(null);
                console.error('Failed to fetch user', err);
            }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const justLoggedIn = urlParams.has('code');

        if (justLoggedIn) {
            fetchUser();
        }
    }, []);

    const getPlaylist = async () => {
        if (!inputValue) return;

        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE_URL}/playlist`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: inputValue }),
            });

            const data = await res.json();

            if (data.playlist) {
                setPlaylist(data.playlist);
                setLastFetchedInput(inputValue);
                setInputValue('');
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
        setIsLoading(false);
    };

    const handleConnectToSpotify = () => {
        window.location.href = `${API_BASE_URL}/login`;
    };

    const handleSaveToSpotify = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/create-playlist`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: spotifyUser.id,
                    playlistName: lastFetchedInput,
                    tracks: playlist,
                }),
            });

            const data = await response.json();
            if (data.playlistUrl) {
                window.open(data.playlistUrl, '_blank');
            } else {
                alert('Something went wrong saving the playlist.');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving to Spotify');
        }
        setIsLoading(false);
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
                    <>
                        <p>Welcome, {spotifyUser.display_name}</p>
                        {!!playlist.length && (
                            <button
                                className="secondary-button"
                                onClick={handleSaveToSpotify}
                            >
                                Save to Spotify <Spotify />
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <p>Connect your Spotify account to save playlists</p>
                        <button
                            className="secondary-button"
                            onClick={handleConnectToSpotify}
                        >
                            Connect to Spotify <Spotify />
                        </button>
                    </>
                )}
                <button
                    className="primary-button"
                    type="button"
                    onClick={getPlaylist}
                >
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
