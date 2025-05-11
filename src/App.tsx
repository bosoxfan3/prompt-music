import React, { useState } from 'react';

function App() {
    const [inputValue, setInputValue] = useState<string>('');
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
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    return (
        <div className="App">
            <input
                type="text"
                placeholder="ex. studying in a thunderstorm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="button" onClick={getPlaylist}>
                Generate Playlist
            </button>
            {playlist.length &&
                playlist.map((song) => (
                    <div key={song.title}>
                        <p>{song.title}</p>
                        <p>{song.artist}</p>
                    </div>
                ))}
        </div>
    );
}

export default App;
