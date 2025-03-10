import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import "./HomePage.css";
import backgroundImage from "../Assets/Images/Homepage.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleAuthAction = () => {
    if (user) {
      signOut(auth)
        .then(() => navigate("/signin"))
        .catch((error) => console.error("Sign-out error:", error));
    } else {
      navigate("/signin");
    }
  };

  return (
    // <div className="homepage">
    <div className="homepage" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", height: "100vh" }}>
      <header className="header">
        <button onClick={handleAuthAction} className="auth-button">
          {user ? "Sign Out" : "Sign In"}
        </button>
      </header>

      <section className="hero">
        <h1>Welcome to Entertainment Hub</h1>
        <p>Your one-stop destination for Movies & Music</p>
      </section>

      <section className="explore-section">
        <div className="card" onClick={() => navigate("/movies")}>
          <h2>Movies</h2>
          <p>Explore the latest and greatest movies from around the world.</p>
          <button className="card-button">Browse Movies</button>
        </div>
        <div className="card" onClick={() => navigate("/music")}>
          <h2>Music</h2>
          <p>Discover trending tracks and timeless classics.</p>
          <button className="card-button">Browse Music</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
