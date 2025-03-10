// src/components/SongList.js
import React from 'react';
import SongCard from './Songcard';
import './Songlist.css';

const SongList = ({ songs }) => {
  return (
    <div className="song-list">
      {songs.map(song => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
};

export default SongList;
