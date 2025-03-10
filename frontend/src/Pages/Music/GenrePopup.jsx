import React, { useState, useEffect } from 'react';
import './GenrePopup.css';

const GenrePopup = ({ onClose, onSave }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const genres = ['Pop', 'Rock', 'Jazz', 'Hip-Hop', 'Classical', 'Electronic'];

  // ✅ Fetch token from localStorage when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('firebaseToken');
    if (!token) {
      console.warn("⚠️ Warning: No Firebase token found in localStorage.");
    }
  }, []);

  // ✅ Toggle genre selection
  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // ✅ Function to send preferences to Flask
  const savePreferencesToBackend = async () => {
    setIsSaving(true);
    
    try {
      const idToken = localStorage.getItem('firebaseToken'); // 🔥 Fetch token from localStorage

      if (!idToken) {
        console.error("🚨 Error: No authentication token found. User must be logged in.");
        alert("You need to sign in before saving preferences.");
        setIsSaving(false);
        return;
      }

      console.log("📢 Sending request to backend with token:", idToken); // Debugging log

      const response = await fetch('http://127.0.0.1:5000/save_music_preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ genres: selectedGenres }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("✅ Preferences saved successfully:", data);
        localStorage.setItem('hasSeenPopup', 'true'); // ✅ Store popup state
      } else {
        console.error("❌ Server error:", data.error);
        alert(`Error saving preferences: ${data.error}`);
      }
    } catch (error) {
      console.error("🌐 Network error:", error);
      alert("Network error! Please check your internet connection.");
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleSave = () => {
    if (selectedGenres.length === 0) {
      alert("Please select at least one genre.");
      return;
    }
    onSave(selectedGenres);
    savePreferencesToBackend();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Select Your Favorite Genres</h2>
        <div className="genre-options">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-btn ${selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => toggleGenre(genre)}
              disabled={isSaving} // Disable buttons while saving
            >
              {genre}
            </button>
          ))}
        </div>
        <div className="popup-actions">
          <button onClick={handleSave} className="save-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className="cancel-btn" disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenrePopup;
