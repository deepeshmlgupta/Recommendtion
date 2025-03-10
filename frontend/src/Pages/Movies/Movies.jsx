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

  return (
    <div className="Movies">
      <Navbar />
      {showPopup && (
        <GenrePopup
          onClose={() => setShowPopup(false)}
          onSave={handleSavePreferences}
        />
      )}
      <div className="hero">
        <img src={hero_banner} alt="Hero Banner" className="banner-img" />
        <div className="hero-caption">
          {/* <img src={hero_title} alt="" className='hero-title' /> */}
          {/* <p>Hello Ji Kesa Ho sare aur kitna ban gaya project aur baki kesa chal rha h project m aur jiven m sab thik</p> */}
          {/* <div className="hero-btns">
            <button className="btn"><img src={play_icon} alt="" />Recommend</button>
            <button className="btn dark-btn"><img src={info_icon} alt="" />Home Page</button>
          </div> */}
          <TitleCards
            onCardClick={handleMovieClick}  // Pass the handleMovieClick function to TitleCards
          />
        </div>
      </div>
      <div>
        <TitleCards title="Popular Movies" category="popular" onCardClick={handleMovieClick} />
        <TitleCards title="Blockbuster Movies" category="top_rated" onCardClick={handleMovieClick} />
        <TitleCards title="Top Picks For You" category="now_playing" onCardClick={handleMovieClick} />
        <TitleCards title="Upcoming Movies" category="upcoming" onCardClick={handleMovieClick} />
      </div>
      <Footer />
    </div>
  );
};

export default Movies;
