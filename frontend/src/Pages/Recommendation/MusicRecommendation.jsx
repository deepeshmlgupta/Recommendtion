import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MusicRecommendation.css";
import Navbar from "../../components/Navbar/Navbar";
import { getAccessToken, searchTracksByGenre } from "../Recommendation/Spotify";

const MusicRecommendation = () => {
  const navigate = useNavigate();
  const { genre } = useParams();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTracksByGenre = async () => {
      try {
        setLoading(true);
        // Get Spotify access token
        const token = await getAccessToken();
        
        // Fetch tracks by genre
        const genreTracks = await searchTracksByGenre(genre || 'pop', token);
        setTracks(genreTracks);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching tracks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracksByGenre();
  }, [genre]);

  if (loading) {
    return (
      <div className="music-container">
        <Navbar />
        <div className="music-content">
          <h2 className="page-title">Loading {genre} tracks...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="music-container">
        <Navbar />
        <div className="music-content">
          <h2 className="page-title">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="music-container">
      <Navbar />
      <div className="music-content">
        <h2 className="page-title">{genre ? `${genre} Tracks` : "Popular Tracks"}</h2>
        
        <div className="tracks-list">
          {tracks.map((track) => (
            <div key={track.id} className="track-card">
              <img 
                src={track.album.images[0]?.url} 
                alt={track.name} 
                className="track-cover" 
              />
              <div className="track-info">
                <h3 className="track-name">{track.name}</h3>
                <p className="track-artist">
                  {track.artists.map(artist => artist.name).join(', ')}
                </p>
                <p className="track-album">{track.album.name}</p>
              </div>
              <button 
                className="play-button"
                onClick={() => window.open(track.external_urls.spotify, '_blank')}
              >
                Play on Spotify
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicRecommendation;