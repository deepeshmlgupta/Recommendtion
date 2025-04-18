// spotifyApi.js
const CLIENT_ID = '208a143c5dae4af0ae290baaaaf72b44';
const CLIENT_SECRET = 'c5d3375c678a496ba862634cb51c2e8d';

export const getAccessToken = async () => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
};

export const searchTracksByGenre = async (genre, token) => {
  // Search for tracks by genre with popularity sorting
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=genre:${genre}&type=track&market=US&limit=50&sort=popularity`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  return data.tracks.items;
};
export const getRecommendationsByGenres = async (genresList, token) => {
  if (!genresList || genresList.length === 0) {
    throw new Error("Genre list cannot be empty for recommendations.");
  }

  // Spotify API allows up to 5 seed values (genres, artists, tracks combined)
  // We'll use up to 5 genres as seeds.
  const seedGenres = genresList.slice(0, 5).join(','); // Take first 5 genres and make comma-separated string

  // Construct the recommendations API URL
  // You can add other parameters like target_*, min_*, max_* for tuning
  const recommendationsUrl = `https://api.spotify.com/v1/recommendations?seed_genres=${encodeURIComponent(seedGenres)}&limit=20`; // Get 20 recommendations

  console.log("Requesting recommendations with URL:", recommendationsUrl);

  const response = await fetch(recommendationsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Spotify Recommendations API Error:", error);
    // Provide more specific error message if available
    if (error.error?.message.includes("invalid seed")) {
         throw new Error(`Spotify recommendations failed: Invalid genre seed(s) provided (${seedGenres}). Please check genre names.`);
    }
    throw new Error(`Spotify recommendations failed: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.tracks; // Recommendations endpoint returns tracks directly in the 'tracks' array
};