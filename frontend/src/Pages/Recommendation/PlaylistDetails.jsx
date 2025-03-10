import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PlaylistDetails.css";

const playlists = {
  trending: { title: "Trending", songs: [
      { id: 1, name: "Blinding Lights", artist: "The Weeknd" },
      { id: 2, name: "Shape of You", artist: "Ed Sheeran" }
    ]
  },
  top: { title: "Top Hits", songs: [
      { id: 3, name: "Uptown Funk", artist: "Bruno Mars" },
      { id: 4, name: "Someone Like You", artist: "Adele" }
    ]
  },
  new: { title: "New Releases", songs: [
      { id: 5, name: "Flowers", artist: "Miley Cyrus" },
      { id: 6, name: "Anti-Hero", artist: "Taylor Swift" }
    ]
  },
  mixes: { title: "Your Mixes", songs: [
      { id: 7, name: "Mix 1", artist: "Various Artists" },
      { id: 8, name: "Mix 2", artist: "Various Artists" }
    ]
  }
};

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playlist = playlists[id];

  if (!playlist) return <h2 style={{ color: "white", textAlign: "center" }}>Playlist not found!</h2>;

  return (
    <div className="playlist-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ Go Back</button>
      <h2>{playlist.title}</h2>
      <ul className="song-list">
        {playlist.songs.map((song) => (
          <li key={song.id} className="song-item">
            <span className="song-name">{song.name}</span>
            <span className="song-artist">{song.artist}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistDetails;
