// src/AlbumDetails.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultImage from './assets/default-disc-image.png'; // Import de l'image par défaut

function AlbumDetails({ album, onClose, accessToken }) {
  const [tracks, setTracks] = useState([]);
  const [albumInfo, setAlbumInfo] = useState(null);

  useEffect(() => {
    if (accessToken && album) {
      console.log('Fetching album details for ID:', album.id);
      axios
        .get(`https://api.spotify.com/v1/albums/${album.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then(response => {
          setAlbumInfo(response.data);
          setTracks(response.data.tracks.items);
        })
        .catch(error => {
          console.error('Error fetching album details:', error);
        });
    } else {
      setAlbumInfo(null);
      setTracks([]);
    }
  }, [accessToken, album]);

  if (!album) {
    return (
      <div className="album-details default">
        <img
          src={defaultImage}
          alt="Sélectionnez un album"
          className="default-image"
        />
        <h2>Sélectionnez un album</h2>
      </div>
    );
  }

  if (!albumInfo) {
    return (
      <div className="album-details loading">
        <p>Chargement des détails de l'album...</p>
      </div>
    );
  }

  return (
    <div className="album-details">
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
      <img src={albumInfo.images[0]?.url} alt={albumInfo.name} />
      <h2>{albumInfo.name}</h2>
      <p>{albumInfo.artists.map(artist => artist.name).join(', ')}</p>
      <p>Date de sortie : {albumInfo.release_date}</p>
      <p>Nombre de pistes : {albumInfo.total_tracks}</p>
      <h3>Liste des pistes :</h3>
      <ul>
        {tracks.map(track => (
          <li key={track.id}>
            {track.track_number}. {track.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlbumDetails;
