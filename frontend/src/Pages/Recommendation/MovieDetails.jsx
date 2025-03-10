import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MovieDetails.css";

const API_KEY = 'de1daa740b9235540eafe28812be129f';
const BASE_URL = 'https://api.themoviedb.org/3';

// MovieDetails component to fetch and display movie details from API
const MovieDetails = () => {
  const { id } = useParams();  // Get the movie ID from the URL
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);  // To store the movie data
  const [loading, setLoading] = useState(true);  // To track loading state
  const [error, setError] = useState(null);  // To handle any errors

  // Fetch movie details when the component mounts or the ID changes
  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);  // Set loading to true while fetching

      try {
        const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();

        if (response.ok) {
          setMovie(data);  // Set the movie data if the response is successful
        } else {
          setError(data.status_message || "Movie not found");  // Handle any error from the API
        }
      } catch (error) {
        setError("Failed to fetch movie details");
      } finally {
        setLoading(false);  // Set loading to false after fetching
      }
    };

    fetchMovieDetails();
  }, [id]);  // Re-run the effect if the movie ID changes

  if (loading) {
    return <div style={{ color: "white", textAlign: "center" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "white", textAlign: "center" }}>{error}</div>;
  }

  if (!movie) {
    return <div style={{ color: "white", textAlign: "center" }}>Movie not found!</div>;
  }

  return (
    <div className="movie-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ Go Back</button>
      <div className="movie-details">
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title} 
          className="movie-poster-large"
        />
        <div className="movie-info">
          <h2>{movie.title}</h2>
          <p><strong>Release Year:</strong> {new Date(movie.release_date).getFullYear()}</p>
          <p><strong>Director:</strong> {movie.director || "N/A"}</p>
          <p><strong>Summary:</strong> {movie.overview}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
