import React from "react";
import { useNavigate } from "react-router-dom";
import "./MusicRecommendation.css";
import Navbar from "../../components/Navbar/Navbar";

const playlists = [
  { id: "trending", title: "Trending", cover: "https://i.scdn.co/image/ab67706c0000da846a1f3d0e5c5c1b7a3f3b3b4d" },
  { id: "top", title: "Top Hits", cover: "https://i.scdn.co/image/ab67706c0000da849d6163a29a8c3cdd7e3a5b1c" },
  { id: "new", title: "New Releases", cover: "https://i.scdn.co/image/ab67706c0000da84a9b765e2f3f0b3c6f6b6a7b2" },
  { id: "mixes", title: "Your Mixes", cover: "https://i.scdn.co/image/ab67706c0000da84b2b3b3a7d9c6c2c1f3f3b3b4" }
];

const MusicRecommendation = () => {
  const navigate = useNavigate();

  return (
    <div className="music-container">
      <Navbar />
      <div className="music-content">
        <h2 className="page-title">Music Recommendations</h2>
        <div className="playlist-grid">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="playlist-card"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <img src={playlist.cover} alt={playlist.title} className="playlist-cover" />
              <h3 className="playlist-title">{playlist.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicRecommendation;
