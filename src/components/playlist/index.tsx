import './style.css';

type Props = {
    title: string;
    playlist: Array<{
        title: string;
        artist: string;
        uri: string | null;
        thumbnail: string | null;
    }>;
};

const Playlist = ({ title, playlist }: Props) => (
    <div className="playlist">
        <p className="built-from">Built from: "{title}"</p>
        {playlist.map((song) => (
            <div key={song.title} className="song">
                <img
                    className="thumbnail"
                    src={
                        song.thumbnail
                            ? song.thumbnail
                            : '/assets/spotifyblank.png'
                    }
                    alt={`${song.title} Album Cover`}
                    width={64}
                    height={64}
                />
                <div>
                    <p className="title">Title: {song.title}</p>
                    <p className="artist">Artist: {song.artist}</p>
                </div>
            </div>
        ))}
    </div>
);

export default Playlist;
