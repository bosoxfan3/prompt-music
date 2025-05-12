import React, { useState } from 'react';
import './App.css';

function App() {
    const [inputValue, setInputValue] = useState<string>('');
    const [lastFetchedInput, setLastFetchedInput] = useState<string>('');
    const [playlist, setPlaylist] = useState<
        { title: string; artist: string }[]
    >([]);

    const getPlaylist = async () => {
        if (!inputValue) return;

        try {
            const res = await fetch(
                'https://prompt-music-production.up.railway.app',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: inputValue }),
                }
            );

            const data = await res.json();

            if (data.playlist) {
                const songs = JSON.parse(data.playlist); // Still parse because GPT returns text
                setPlaylist(songs);
                setLastFetchedInput(inputValue);
                setInputValue('');
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
                <button type="button" onClick={getPlaylist}>
                    Generate Playlist
                </button>
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
