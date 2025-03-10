import React, { useState } from 'react';
import './Header.css'
// import logo from '../../Assets/logo.png'
import search_icon from '../../Assets/search_icon.svg'
import bell_icon from '../../Assets/bell_icon.svg'
import profile_img from '../../Assets/profile_img.png'
import caret_icon from '../../Assets/caret_icon.svg'
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = () => {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          localStorage.removeItem("authToken");
          navigate("/signin");
        })
        .catch((error) => {
          console.error("Sign-out error:", error);
        });
  };

  const handleSearch = (e) => { 
      e.preventDefault();
      console.log("Searching for:", searchQuery);
      // Add your search logic here
  };

  return (
      <div className='Header'>
          <div className="Header-left">
              <ul> 
                  <li onClick={() => navigate("/")}>Home</li>
                  <li onClick={() => navigate("/MusicRecommendation")}>Recommendation</li>
                  {/* <li>Recommendation</li> */}
              </ul>
          </div>
          <div className="Header-right">
              <form onSubmit={handleSearch} className="search-bar">
                  <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">Search</button>
              </form>
              <p>Children</p>
              <img src={bell_icon} alt="" className='icons'/>
              <div className="Header-profile">
                  <img src={profile_img} alt="" className='profile'/>
                  <img src={caret_icon} alt="" />
                  <div className="dropdown">
                      <button onClick={handleSignOut}>Sign Out</button>
                  </div>
              </div>   
          </div>
      </div>
  );
};

export default Header;
