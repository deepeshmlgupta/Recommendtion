import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Recommendation.css";
import Navbar from '../../components/Navbar/Navbar';

const OMDB_API_KEY = "869ea884";  // Replace with your OMDb API key
const FLASK_API_URL = "http://127.0.0.1:5000/get_recommendations"; // Flask API Endpoint

const Recommendation = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        console.log("User Email:", user.email);
      } else {
        setError("User not logged in.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchMovieIds = async () => {
      try {
        const response = await fetch(FLASK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({  
            email: userEmail 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Flask API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received Movie IDs:", data.movie_ids);

        if (!data.movie_ids || !Array.isArray(data.movie_ids)) {
          throw new Error("Invalid movie IDs received from server");
        }

        if (data.movie_ids.length > 0) {
          fetchMovieDetails(data.movie_ids);
        } else {
          setError("No recommendations found for your preferences");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching movie IDs:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovieIds();
  }, [userEmail]);

  const fetchMovieDetails = async (imdbIds) => {
    try {
      const moviePromises = imdbIds.map(async (imdbID) => {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();

        if (data.Response === "False") {
          console.warn(`OMDb API Error for ${imdbID}: ${data.Error}`);
          return null;
        }

        return {
          id: imdbID,
          name: data.Title || "Unknown Title",
          poster: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/200",
        };
      });

      const movieResults = (await Promise.all(moviePromises)).filter(Boolean);
      setMovies(movieResults);
    } catch (err) {
      console.error("Error fetching movie details:", err);
      setError("Error fetching movie details.");
    } finally {
      setLoading(false);
    }
  };


  const handleMovieClick = async (movieId) => {
    if (!userEmail) {
      console.error("User email not found!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/save_click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          movie_id: movieId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save click");
      }

      console.log(`✅ Click saved for ${movieId}`);
    } catch (error) {
      console.error("Error saving click:", error);
    }

    navigate(`/movie/${movieId}`);
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
                onClick={() => handleMovieClick(movie.id)}
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