import React, { useState, useEffect } from 'react';
import './Movies.css';
import Navbar from '../../components/Navbar/Navbar';
import hero_banner from '../../Assets/hero_banner.jpg';
// import hero_title from '../../Assets/hero_title.png';
import play_icon from '../../Assets/play_icon.png';
import info_icon from '../../Assets/info_icon.png';
import TitleCards from '../../components/TitleCards/TitleCards';
import Footer from '../../components/Footer/Footer';
import GenrePopup from './GenrePopup';
import { useNavigate } from 'react-router-dom';

const Movies = () => {
  const [showPopup, setShowPopup] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenPopup');
    if (!hasSeenPopup) {
      setShowPopup(true);
    }
  }, []);

  const handleSavePreferences = (selectedGenres) => {
    console.log('Selected Genres:', selectedGenres);
    // You can use selectedGenres to filter or customize the movie list
  };

  // Function to navigate to the movie details page
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  // Handler for explicitly closing the popup without saving
  const handleClosePopup = () => {
    // Hide the popup
    setShowPopup(false);
    // Set the flag in localStorage so it doesn't show again
    localStorage.setItem('hasSeenPopup', 'true');
  }

  return (
    <div className="Movies">
      <Navbar />

      {/* --- Conditionally Render Popup --- */}
      {/* This will now render if showPopup becomes true */}
      {showPopup && (
        <GenrePopup
          onClose={handleClosePopup} // Use the closing handler
          onSave={handleSavePreferences} // Use the saving handler
        />
      )}

      {/* Hero Section */}
      <div className="hero">
        <img src={hero_banner} alt="Hero Banner" className="banner-img" />
        <div className="hero-caption">
          {/* Hero content can go here */}
        </div>
      </div>

      {/* Movie Lists Section */}
      <div className="movie-lists">
        <TitleCards
           title="Now Playing"
           category="now_playing"
           onCardClick={handleMovieClick}
        />
        <TitleCards
           title="Trending Now"
           category="trending/movie/week"
           onCardClick={handleMovieClick}
        />
         <TitleCards
           title="Upcoming"
           category="upcoming"
           onCardClick={handleMovieClick}
        />
        <TitleCards
           title="Top Rated"
           category="top_rated"
           onCardClick={handleMovieClick}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Movies;
