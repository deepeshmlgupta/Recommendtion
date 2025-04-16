import React from "react";
import { useNavigate } from "react-router-dom";
import "./MusicRecommendation.css";
import Navbar from "../../components/Navbar/Navbar";

const playlists = [
  { 
    id: "37i9dQZF1DXcBWIGoYBM5M", // Today's Top Hits
    title: "Top Hits", 
    cover: "https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a6" 
  },
  { 
    id: "37i9dQZEVXbLRQDuF5jeBp", // RapCaviar
    title: "Trending Rap", 
    cover: "https://i.scdn.co/image/ab67706f00000002a980b15599fed6e65f8ae6f9"
  },
  { 
    id: "37i9dQZF1DX4JAvHpjipBk", // New Music Friday
    title: "New Releases", 
    cover: "https://i.scdn.co/image/ab67706f00000002a980b15599fed6e65f8ae6f9" 
  },
  { 
    id: "37i9dQZF1EQncLwOalG3K7", // Mix of the Week
    title: "Your Mix", 
    cover: "https://i.scdn.co/image/ab67706f00000002a980b15599fed6e65f8ae6f9" 
  }
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
