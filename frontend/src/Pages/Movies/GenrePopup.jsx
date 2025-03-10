import React, { useState, useEffect } from 'react';
import './GenrePopup.css';
import { getAuth } from "firebase/auth";

const GenrePopup = ({ userEmail, onClose, onSave }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const genres = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime','Drama','Documentary',
                  'Family','Fantasy','Film_Noir', 'History','Horror','Mystery','Musical', 'Romance','Sci_Fi',
                  'Sports', 'Thriller','War','Western'];

  // ✅ Fetch user preferences from Flask when component mounts
  useEffect(() => {
    if (!userEmail) return;

    setIsLoading(true); // Start loading

    fetch(`/get_preferences/${userEmail}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched preferences:", data.preferences);
        setSelectedGenres(data.preferences || []);
      })
      .catch((error) => console.error("Error fetching preferences:", error))
      .finally(() => setIsLoading(false)); // Stop loading
  }, [userEmail]);

  // ✅ Toggle genre selection
  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // ✅ Save Preferences to Flask
  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Error: User is not signed in.");
      return;
    }

    try {
      setIsLoading(true); // Start loading
      const idToken = await user.getIdToken(); // ✅ Get Firebase ID Token

      const response = await fetch("/save_preferences", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}` // ✅ Send token to Flask
        },
        body: JSON.stringify({ email: user.email, genres: selectedGenres }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("✅ Preferences saved:", data);
        alert("Preferences saved successfully!");
      } else {
        console.error("❌ Server error:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("🚨 Fetch error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
      onSave(selectedGenres); // Pass selected genres back to parent
      onClose(); // Close popup
    }
  };

  console.log("userEmail before saving:", userEmail);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Select Your Favorite Movie Genres</h2>

        {isLoading ? (
          <p>Loading...</p> // Show loading text while fetching
        ) : (
          <div className="genre-options">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`genre-btn ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                onClick={() => toggleGenre(genre)}
                disabled={isLoading} // Disable buttons while saving
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        <div className="popup-actions">
          <button onClick={handleSave} className="save-btn" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} className="cancel-btn" disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenrePopup;
