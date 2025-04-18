import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PlaylistDetails.css"; // Make sure you have this CSS file or remove the import

// !! IMPORTANT SECURITY WARNING !!
// Exposing your Client Secret in frontend code is a security risk.
// For production, use a backend proxy to handle token requests securely.
const CLIENT_ID = "208a143c5dae4af0ae290baaaaf72b44"; // Replace if needed
const CLIENT_SECRET = "c5d3375c678a496ba862634cb51c2e8d"; // Replace if needed

const PlaylistDetails = () => {
  // const { id } = useParams(); // Get playlist ID from URL
  // Inside the PlaylistDetails component function:
// const { id } = useParams(); // Temporarily comment out
const id = '37i9dQZF1DXcBWIGoYBM5M'; // Hardcode Spotify's "Today's Top Hits" ID
console.log("Using hardcoded Playlist ID for testing:", id); // Log the test ID

// ... rest of the component
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const [accessToken, setAccessToken] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);

  // --- Effect 1: Fetch Access Token ---
  useEffect(() => {
    // Prevent state updates if component unmounts while fetching
    let isMounted = true;
    setError(null); // Reset error on initial load or credential change

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
        if (isMounted) {
          setAccessToken(res.data.access_token);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        if (isMounted) {
          
          setError(
            `Failed to authenticate with Spotify: ${
              error.response?.data?.error_description || error.message
            }`
          );
          setLoading(false); // Stop loading if token fails
        }
      }
    };

    // Only fetch if CLIENT_ID and CLIENT_SECRET are provided
    if (CLIENT_ID && CLIENT_SECRET) {
        fetchToken();
    } else {
        setError("Spotify Client ID or Secret is missing.");
        setLoading(false);
    }


    // Cleanup function
    return () => {
      isMounted = false;
    };
    // Dependency array is empty, so it runs once on mount
  }, []); // Removed CLIENT_ID, CLIENT_SECRET as deps since they are constants above

  // --- Effect 2: Fetch Playlist Data (when token and ID are available) ---
  useEffect(() => {
    // Don't fetch if we don't have a token, ID, or if there was already an error
    if (!accessToken || !id || error) {
        // If no token/ID but loading is still true, stop loading.
        if (loading && !error) setLoading(false);
        return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null); // Reset error for new fetch attempt

    const fetchPlaylistData = async () => {
      try {
        // --- Get Playlist Header Info ---
        const playlistRes = await axios.get(
          // Use the correct playlist endpoint
          `https://api.spotify.com/v1/playlists/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
             // Optional: Specify fields to reduce payload size if needed
             params: {
               fields: "id,name,description,images,owner(display_name)"
             }
          }
        );
        if (isMounted) {
          setPlaylistInfo(playlistRes.data);
        }

        // --- Get Playlist Tracks ---
        const tracksRes = await axios.get(
          // Use the correct endpoint for playlist tracks
          `https://api.spotify.com/v1/playlists/{id}/tracks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              limit: 50, // Get up to 50 tracks
              // Specify necessary fields including preview_url
              fields:
                "items(track(id,name,artists(name),duration_ms,album(images),preview_url))",
            },
          }
        );
        if (isMounted) {
            // Filter out items where track is null (can happen if a track was deleted)
             setTracks(tracksRes.data.items.filter(item => item.track));
        }
      } catch (error) {
        console.error("Error fetching playlist data:", error);
        if (isMounted) {
          // Provide more specific Spotify API errors if available
           const spotifyError = error.response?.data?.error;
           setError(
             `Failed to fetch playlist data: ${
               spotifyError?.message || error.message
             } ${spotifyError?.status ? `(${spotifyError.status})` : ''}`
           );
        }
      } finally {
        // Ensure loading is set to false even if errors occurred
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlaylistData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
    // Re-run this effect if the access token or playlist ID changes
  }, [accessToken, id]); // Keep error out of deps to avoid loop if fetch fails


  const handleTrackClick = (trackItem) => {
      // trackItem here is the full item from the tracks array { track: { ... } }
    setSelectedTrack(trackItem.track); // Set the actual track object
  };

  const formatDuration = (ms) => {
    if (ms === null || ms === undefined) return '--:--';
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // --- Render Logic ---
  return (
    <div className="playlist-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* --- Loading State --- */}
      {loading && <p>Loading playlist...</p>}

      {/* --- Error State --- */}
      {error && <div className="error-message" style={{ color: "red" }}>Error: {error}</div>}

      {/* --- Content (only render if not loading and no error) --- */}
      {!loading && !error && playlistInfo && (
        <>
          <div className="playlist-header">
            {/* Use optional chaining for safety */}
            <img
              src={playlistInfo.images?.[0]?.url}
              alt={playlistInfo.name || "Playlist cover"}
              className="playlist-cover"
              // Add a fallback style if no image
              style={{ backgroundColor: '#333' }}
            />
            <div className="playlist-meta">
              <h1>{playlistInfo.name}</h1>
              {/* Render description only if it exists */}
              {playlistInfo.description && <p className="description" dangerouslySetInnerHTML={{ __html: playlistInfo.description }}></p>}
              <p className="owner">By {playlistInfo.owner?.display_name || 'Spotify'}</p>
            </div>
          </div>

          <div className="tracks-container">
            <h2>Tracks</h2>
            <div className="track-list">
              {tracks.length > 0 ? (
                  tracks.map((item, index) => (
                    <div
                      // Use track ID if available, otherwise fallback might be needed if IDs aren't unique (unlikely here)
                      key={item.track?.id ? `${item.track.id}-${index}` : `track-${index}`}
                      className="track-item"
                      onClick={() => handleTrackClick(item)}
                      // Add a class if the track has no preview URL to visually indicate it?
                      style={{ cursor: item.track?.preview_url ? 'pointer' : 'default' }}
                    >
                      <span className="track-number">{index + 1}</span>
                       {/* Optional: Small album art */}
                       <img
                         src={item.track?.album?.images?.[item.track.album.images.length - 1]?.url} // Use smallest image
                         alt="" // Decorative
                         className="track-item-image"
                         style={{ width: '40px', height: '40px', marginRight: '10px', backgroundColor: '#555' }}
                       />
                      <div className="track-info">
                        <h3 className="track-name">{item.track?.name || "Unknown Track"}</h3>
                        <p className="track-artist">
                          {item.track?.artists?.map((artist) => artist.name).join(", ") || "Unknown Artist"}
                        </p>
                      </div>
                      <span className="track-duration">
                        {formatDuration(item.track?.duration_ms)}
                      </span>
                       {/* Optional: Indicator if playable */}
                       {!item.track?.preview_url && <span style={{ marginLeft: '10px', fontSize: '0.8em', opacity: 0.6 }}>(No Preview)</span>}
                    </div>
                  ))
              ) : (
                <p>No tracks found in this playlist.</p>
              )}
            </div>
          </div>
        </>
      )}

       {/* --- Selected Track Details / Player --- */}
      {selectedTrack && (
        // Simple modal or overlay effect would be nice here
        <div className="track-details-overlay" onClick={() => setSelectedTrack(null)}> {/* Click outside to close */}
             <div className="track-details-content" onClick={e => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
                <h2>{selectedTrack.name}</h2>
                <p>Artist: {selectedTrack.artists?.map(artist => artist.name).join(", ")}</p>
                <img
                    src={selectedTrack.album?.images?.[0]?.url} // Larger image
                    alt={selectedTrack.name || "Album cover"}
                    className="track-image"
                    style={{ maxWidth: '200px', display: 'block', margin: '10px auto', backgroundColor: '#333' }}
                />

                {/* --- Audio Player --- */}
                {selectedTrack.preview_url ? (
                    <audio controls autoPlay src={selectedTrack.preview_url} style={{width: '100%'}}>
                    Your browser does not support the audio element. (Track: {selectedTrack.name})
                    </audio>
                ) : (
                    <p>Sorry, no preview available for this track.</p>
                )}

                <button onClick={() => setSelectedTrack(null)} style={{ marginTop: '15px'}}>Close</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;