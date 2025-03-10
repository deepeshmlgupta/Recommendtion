import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MusicDetails.css";

const songs = [
  { id: 1, name: "Blinding Lights", artist: "The Weeknd", album: "After Hours", year: 2020, cover: "https://i.scdn.co/image/ab67616d0000b2734e3457f6734a8b76ff8431d0" },
  { id: 2, name: "Shape of You", artist: "Ed Sheeran", album: "Divide", year: 2017, cover: "https://i.scdn.co/image/ab67616d0000b2733e3ee81b1e9127c8bc93df99" },
  { id: 3, name: "Uptown Funk", artist: "Bruno Mars", album: "Uptown Special", year: 2015, cover: "https://i.scdn.co/image/ab67616d0000b273f6b6e93f0a0d3b6c4a91cc17" }
];

const MusicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const song = songs.find(s => s.id === parseInt(id));

  if (!song) return <h2 style={{ color: "white", textAlign: "center" }}>Song not found!</h2>;

  return (
    <div className="music-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ Go Back</button>
      <div className="music-details">
        <img src={song.cover} alt={song.name} className="music-cover-large" />
        <div className="music-info">
          <h2>{song.name}</h2>
          <p><strong>Artist:</strong> {song.artist}</p>
          <p><strong>Album:</strong> {song.album}</p>
          <p><strong>Year:</strong> {song.year}</p>
        </div>
      </div>
    </div>
  );
};

export default MusicDetails;
