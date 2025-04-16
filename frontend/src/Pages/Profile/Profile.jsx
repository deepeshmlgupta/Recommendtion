import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import './Profile.css';

const movieGenresList = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Drama', 'Documentary',
  'Family', 'Fantasy', 'Film_Noir', 'History', 'Horror', 'Mystery', 'Musical', 'Romance', 'Sci_Fi',
  'Sports', 'Thriller', 'War', 'Western'
];

const musicGenresList = [
  'Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'Reggae',
  'Blues', 'Metal', 'Folk', 'Punk', 'Soul', 'Funk', 'R&B', 'Gospel'
];

const UserProfile = () => {
  const [userData, setUserData] = useState({
    email: '',
    moviePreferences: [],
    musicPreferences: [],
  });
  const [newMoviePref, setNewMoviePref] = useState('');
  const [newMusicPref, setNewMusicPref] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/signin');
          return;
        }

        const token = await user.getIdToken();
        const prefsRes = await fetch(`http://127.0.0.1:5000/get_preferences/${encodeURIComponent(user.email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!prefsRes.ok) throw new Error('Failed to fetch preferences');

        const prefsData = await prefsRes.json();
        setUserData({
          email: user.email,
          moviePreferences: prefsData.preferences || [],
          musicPreferences: prefsData.music_preferences || [],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch preferences');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auth, navigate]);

  const updateMoviePreferences = async (updatedPrefs) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const response = await fetch(`http://127.0.0.1:5000/save_preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, genres: updatedPrefs }),
      });

      if (!response.ok) throw new Error('Update failed');

      setUserData((prev) => ({ ...prev, moviePreferences: updatedPrefs }));
      setNewMoviePref('');
    } catch (error) {
      console.error('Error updating movie preferences:', error.message);
    }
  };

  const updateMusicPreferences = async (updatedPrefs) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const response = await fetch(`http://127.0.0.1:5000/save_music_preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, genres: updatedPrefs }),
      });

      if (!response.ok) throw new Error('Update failed');

      setUserData((prev) => ({ ...prev, musicPreferences: updatedPrefs }));
      setNewMusicPref('');
    } catch (error) {
      console.error('Error updating music preferences:', error.message);
    }
  };

  const addPreference = (type, genre) => {
    if (!genre || userData[`${type}Preferences`].includes(genre)) return;
    const updatedPrefs = [...userData[`${type}Preferences`], genre];
    if (type === 'movie') updateMoviePreferences(updatedPrefs);
    if (type === 'music') updateMusicPreferences(updatedPrefs);
  };

  const removePreference = (type, genre) => {
    const updatedPrefs = userData[`${type}Preferences`].filter(g => g !== genre);
    if (type === 'movie') updateMoviePreferences(updatedPrefs);
    if (type === 'music') updateMusicPreferences(updatedPrefs);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="profile-section">
        <h2>Email: {userData.email}</h2>

        <div className="preferences">
          <h3>Movie Genre Preferences</h3>
          <ul>
            {userData.moviePreferences.map((genre, index) => (
              <li key={index}>{genre} <button onClick={() => removePreference('movie', genre)}>Remove</button></li>
            ))}
          </ul>
          <select value={newMoviePref} onChange={(e) => setNewMoviePref(e.target.value)}>
            <option value="">Select a movie genre</option>
            {movieGenresList.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
          <button onClick={() => addPreference('movie', newMoviePref)} disabled={!newMoviePref}>Add Genre</button>
        </div>

        <div className="preferences">
          <h3>Music Genre Preferences</h3>
          <ul>
            {userData.musicPreferences.map((genre, index) => (
              <li key={index}>{genre} <button onClick={() => removePreference('music', genre)}>Remove</button></li>
            ))}
          </ul>
          <select value={newMusicPref} onChange={(e) => setNewMusicPref(e.target.value)}>
            <option value="">Select a music genre</option>
            {musicGenresList.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
          <button onClick={() => addPreference('music', newMusicPref)} disabled={!newMusicPref}>Add Genre</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
