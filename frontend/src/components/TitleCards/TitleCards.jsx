import React, { useEffect, useRef, useState } from 'react';
import './TitleCards.css';

const API_KEY = 'e8a14bdc910bee581cfbeae7041fc4d1'; // Keep your API key secure
const BASE_URL = 'https://api.themoviedb.org/3';

const TitleCards = ({ title, category, movieId = null, type = 'popular', onCardClick }) => {
  const [movies, setMovies] = useState([]);
  const cardsRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      let url = ''; // Initialize url

      // --- Logic to determine the correct API endpoint ---
      if (category === "recommendations" && movieId) {
        // Handle recommendations based on a specific movie ID
        url = `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`;
      } else if (category === "trending/movie/week") {
        // Handle the specific endpoint for trending movies
        url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US&page=1`;
      } else if (category) {
        // Handle standard movie categories like popular, top_rated, now_playing, upcoming
        url = `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=1`;
      } else {
          // Optional: Handle cases where category might be missing, though unlikely based on Movies.jsx usage
          console.warn("TitleCards called without a valid category (excluding recommendations)");
          return; // Don't fetch if the category isn't set correctly
      }
      // --- End of endpoint logic ---


      // Only proceed if a valid URL was constructed
      if (!url) {
        console.error("Could not determine API URL for category:", category, "and movieId:", movieId);
        return;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          // Throw an error if response is not successful (e.g., 404, 401)
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.results) {
          setMovies(data.results);
        } else {
          console.error('Invalid API response structure:', data);
          setMovies([]); // Reset movies on invalid data
        }
      } catch (error) {
        console.error('Error fetching movies for category', category, ':', error);
        setMovies([]); // Reset movies on fetch error
      }
    };

    fetchMovies();
  }, [category, movieId]); // Dependencies: fetch again if category or movieId changes

  const handleWheel = (event) => {
    // Horizontal scroll on vertical wheel movement
    event.preventDefault();
    if (cardsRef.current) {
      cardsRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    const currentRef = cardsRef.current; // Capture ref value
    if (currentRef) {
      currentRef.addEventListener('wheel', handleWheel, { passive: false }); // Use passive: false for preventDefault
      // Cleanup function to remove the event listener
      return () => {
          if (currentRef) { // Check if ref still exists on cleanup
            currentRef.removeEventListener('wheel', handleWheel);
          }
      };
    }
  }, [movies]); // Re-attach listener if movies list/ref changes (e.g., after fetch)

  return (
    <div className={`title-cards ${type}`}>
      <h2>{title}</h2>
      {/* Conditional rendering based on movies array */}
      {movies.length > 0 ? (
        <div className="card-list" ref={cardsRef}>
          {movies.map((movie) => (
            <div
              className={`card card-${type}`}
              key={movie.id}
              onClick={() => onCardClick(movie.id)} // Trigger the onCardClick function passed as prop
            >
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/240x360?text=No+Image'}
                alt={movie.title || movie.name} // Use movie.name as fallback for trending items which might include TV shows if API changes
                loading="lazy" // Add lazy loading for images
              />
              {/* Display title below the image */}
              <p>{movie.title || movie.name}</p>
            </div>
          ))}
        </div>
      ) : (
         // Display nothing or a placeholder if no movies are loaded or found for this category
         <p></p> // Or potentially: <p>Loading...</p> or <p>No movies found.</p>
      )}
    </div>
  );
};

export default TitleCards;