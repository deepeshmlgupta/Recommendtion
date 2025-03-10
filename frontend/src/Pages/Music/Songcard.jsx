// src/components/SongCard.js
import React from 'react';
import './Songcard.css';

const SongCard = ({ song }) => {
  return (
    <div className="song-card">
      <img src={song.image} alt={song.title} className="song-img" />
      <div className="song-details">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-artist">{song.artist}</p>
        <p className="song-genre">{song.genre}</p>
      </div>
    </div>
  );
};

export default SongCard;
