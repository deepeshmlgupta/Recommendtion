import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Recommendation.css";
import Navbar from '../../components/Navbar/Navbar';

const OMDB_API_KEY = "869ea884";  // Replace with your OMDb API key
const FLASK_API_URL = "http://127.0.0.1:5000/get_recommendations"; // Flask API Endpoint

const Recommendation = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch movie IDs from Flask API
  useEffect(() => {
    const fetchMovieIds = async () => {
      try {
        const response = await fetch(FLASK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ genres: ["Action", "Adventure"] }), // Ensure genres are sent
        });

        if (!response.ok) {
          throw new Error(`Flask API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received Movie IDs:", data.movie_ids); // Debugging

        if (data.movie_ids && Array.isArray(data.movie_ids) && data.movie_ids.length > 0) {
          fetchMovieDetails(data.movie_ids);
        } else {
          throw new Error("No movie IDs received from Flask.");
        }
      } catch (err) {
        console.error("Error fetching movie IDs:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovieIds();
  }, []);

  // ✅ Fetch movie details from OMDb API using IMDb IDs
  const fetchMovieDetails = async (imdbIds) => {
    try {
      const moviePromises = imdbIds.map(async (imdbID) => {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();

        if (data.Response === "False") {
          console.warn(`OMDb API Error for ${imdbID}: ${data.Error}`);
          return null; // Skip if movie not found
        }

        return {
          id: imdbID,
          name: data.Title || "Unknown Title",
          poster: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/200",
        };
      });

      const movieResults = (await Promise.all(moviePromises)).filter(Boolean); // Remove null values
      setMovies(movieResults);
    } catch (err) {
      console.error("Error fetching movie details:", err);
      setError("Error fetching movie details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nav-container">
      <Navbar />
      <div className="recommendation-container">
        <h2 className="page-title">Movie Recommendations</h2>

        {loading ? (
          <p>Loading movies...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : movies.length > 0 ? (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div 
                key={movie.id} 
                className="movie-card"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <img src={movie.poster} alt={movie.name} className="movie-poster" />
                <h3 className="movie-title">{movie.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p>No movies found.</p>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
