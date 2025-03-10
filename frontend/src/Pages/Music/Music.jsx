import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import GenrePopup from "./GenrePopup";
import "./Music.css";

const CLIENT_ID = "3cfe32744c834b7e9d56637c142e009c";
const CLIENT_SECRET = "b556d723a4d548b18690a26a62550cbf";

const Music = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null); // New state for selected song details

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

  useEffect(() => {
    if (!accessToken) return;
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://api.spotify.com/v1/browse/new-releases", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSongs(
          res.data.albums.items.map((album) => ({
            id: album.id,
            title: album.name,
            artist: album.artists.map((artist) => artist.name).join(", "),
            image: album.images[0]?.url || "",
          }))
        );
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
      setLoading(false);
    };
    fetchSongs();
  }, [accessToken]);

  const handleSongClick = async (songId) => {
    try {
      const res = await axios.get(`https://api.spotify.com/v1/albums/${songId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSelectedSong(res.data); // Store the song details in state
    } catch (error) {
      console.error("Error fetching song details:", error);
    }
  };

  return (
    <div className="music-page">
      <Header />
      {showPopup && <GenrePopup onClose={() => setShowPopup(false)} onSave={() => {}} />}
      <h1>🎶 New Releases</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="song-list">
          {songs.map((song) => (
            <div
              key={song.id}
              className="song-item"
              onClick={() => handleSongClick(song.id)} // Make the song card clickable
            >
              <img src={song.image} alt={song.title} />
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
          ))}
        </div>
      )}

      {selectedSong && (
        <div className="song-details">
          <h2>{selectedSong.name}</h2>
          <p>Artist: {selectedSong.artists.map((artist) => artist.name).join(", ")}</p>
          <p>Release Date: {selectedSong.release_date}</p>
          <p>Genres: {selectedSong.genres.join(", ")}</p>
          <div className="song-image">
            <img src={selectedSong.images[0]?.url} alt={selectedSong.name} />
          </div>
          <audio controls>
            <source src={selectedSong.external_urls.spotify} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default Music;
