import React, { useState } from 'react';
import './RecommendationNav.css';
import bell_icon from '../../Assets/bell_icon.svg';
import profile_img from '../../Assets/profile_img.png';
import caret_icon from '../../Assets/caret_icon.svg';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";

const RecommendationNav = () => {
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
        <div className='RecommendationNav'>
            <div className="RecommendationNav-left">
                <ul> 
                    <li onClick={() => navigate("/")}>Home</li>
                    <li onClick={() => navigate("/Movies")}>Movies</li>
                    {/* <li>Recommendation</li> */}
                </ul>
            </div>
            <div className="RecommendationNav-right">
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
                <div className="RecommendationNav-profile">
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

export default RecommendationNav;
