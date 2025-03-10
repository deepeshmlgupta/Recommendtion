import React, { useEffect, useRef, useState } from 'react';
import './TitleCards.css';

const API_KEY = 'de1daa740b9235540eafe28812be129f';
const BASE_URL = 'https://api.themoviedb.org/3';

const TitleCards = ({ title, category, movieId = null, type = 'popular', onCardClick }) => {
  const [movies, setMovies] = useState([]);
  const cardsRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      let url = `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=1`;
      
      if (category === "recommendations" && movieId) {
        url = `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`;
      }
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results) {
          setMovies(data.results);
        } else {
          console.error('Invalid API response:', data);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [category, movieId]);

  const handleWheel = (event) => {
    event.preventDefault();
    if (cardsRef.current) {
      cardsRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    if (cardsRef.current) {
      cardsRef.current.addEventListener('wheel', handleWheel);
      return () => cardsRef.current.removeEventListener('wheel', handleWheel);
    }
  }, []);

  return (
    <div className={`title-cards ${type}`}>
      <h2>{title}</h2>
      {movies.length === 0 ? (
        <p></p>
      ) : (
        <div className="card-list" ref={cardsRef}>
          {movies.map((movie) => (
            <div
              className={`card card-${type}`}
              key={movie.id}
              onClick={() => onCardClick(movie.id)}  // Trigger the onCardClick function
            >
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/240x360?text=No+Image'}
                alt={movie.title}
              />
              <p>{movie.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TitleCards;
