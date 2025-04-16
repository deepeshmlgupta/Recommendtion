import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PlaylistDetails.css";

const CLIENT_ID = "3cfe32744c834b7e9d56637c142e009c";
const CLIENT_SECRET = "b556d723a4d548b18690a26a62550cbf";

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Fetch access token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.post(
          "https://accounts.spotify.com/api/token",
          new URLSearchParams({ grant_type: "client_credentials" }),
          {
            headers: {
              Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        setAccessToken(res.data.access_token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  // Fetch playlist data when token is available
  useEffect(() => {
    if (!accessToken) return;

    const fetchPlaylistData = async () => {
      setLoading(true);
      try {
        // First get basic playlist info
        const playlistRes = await axios.get(
          `https://api.spotify.com/v1/playlists/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              fields: "name,description,images,owner(display_name)"
            }
          }
        );
        setPlaylistInfo(playlistRes.data);

        // Then get tracks
        const tracksRes = await axios.get(
          `https://api.spotify.com/v1/browse/new-releases`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              limit: 50,
              fields: "items(track(id,name,artists(name),duration_ms,album(images)))"
            }
          }
        );
        setTracks(tracksRes.data.items);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
      setLoading(false);
    };

    fetchPlaylistData();
  }, [accessToken, id]);

  const handleTrackClick = (track) => {
    setSelectedTrack(track.track);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="playlist-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {loading ? (
        <p>Loading playlist...</p>
      ) : (
        <>
          {playlistInfo && (
            <div className="playlist-header">
              <img 
                src={playlistInfo.images[0]?.url} 
                alt={playlistInfo.name} 
                className="playlist-cover"
              />
              <div className="playlist-meta">
                <h1>{playlistInfo.name}</h1>
                <p className="description">{playlistInfo.description}</p>
                <p className="owner">By {playlistInfo.owner.display_name}</p>
              </div>
            </div>
          )}

          <div className="tracks-container">
            <h2>Tracks</h2>
            <div className="track-list">
              {tracks.map((item, index) => (
                <div 
                  key={`${item.track.id}-${index}`} 
                  className="track-item"
                  onClick={() => handleTrackClick(item)}
                >
                  <span className="track-number">{index + 1}</span>
                  <div className="track-info">
                    <h3 className="track-name">{item.track.name}</h3>
                    <p className="track-artist">
                      {item.track.artists.map(artist => artist.name).join(", ")}
                    </p>
                  </div>
                  <span className="track-duration">
                    {formatDuration(item.track.duration_ms)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedTrack && (
        <div className="track-details">
          <h2>{selectedTrack.name}</h2>
          <p>Artist: {selectedTrack.artists.map(artist => artist.name).join(", ")}</p>
          <img 
            src={selectedTrack.album?.images[0]?.url} 
            alt={selectedTrack.name} 
            className="track-image"
          />
          <audio controls>
            <source src={`https://open.spotify.com/track/${selectedTrack.id}`} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <button onClick={() => setSelectedTrack(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;