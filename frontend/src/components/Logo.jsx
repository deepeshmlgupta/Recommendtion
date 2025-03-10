import React from 'react';
import './Logo.css'; // Import CSS file for styling

const Logo = () => {
  return (
    <div className="logo-container">
      <img
        src=".components/Assets/person.png" // Replace with your logo image URL
        alt="Logo"
        className="logo"
      />
    </div>
  );
};

export default Logo;
