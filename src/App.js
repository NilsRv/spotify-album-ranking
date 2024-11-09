// src/App.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { getQueryParams } from './utils/getQueryParams';
import AlbumDetails from './AlbumDetails';

function Navbar({ accessToken, handleLogin, handleLogout }) {
  return (
    <nav className="navbar">
      <h1>Spotify Album Ranking</h1>
      {!accessToken ? (
        <button onClick={handleLogin}>Se connecter avec Spotify</button>
      ) : (
        <button onClick={handleLogout}>Se déconnecter</button>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>
        Développé par Nils Riviere
      </p>
    </footer>
  );
}

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    const { accessToken, refreshToken } = getQueryParams();
    if (accessToken) {
      console.log('Access Token:', accessToken);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      window.history.pushState({}, null, '/'); // Nettoie l'URL
    }
  }, []);

  const refreshAccessToken = () => {
    axios
      .get(`/api/refresh_token?refresh_token=${refreshToken}`)
      .then(response => {
        setAccessToken(response.data.access_token);
      })
      .catch(error => {
        console.error(error);
        setError('Impossible de rafraîchir le token.');
      });
  };
  

  useEffect(() => {
    if (accessToken) {
      console.log('Fetching top tracks with access token:', accessToken);
      axios
        .get(
          'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then(response => {
          const tracks = response.data.items;
          const albumMap = {};

          tracks.forEach(track => {
            const album = track.album;
            const albumId = album.id;

            if (!albumMap[albumId]) {
              albumMap[albumId] = {
                id: albumId, // Inclure l'ID de l'album
                name: album.name,
                image: album.images[0]?.url || '',
                artist: album.artists.map(artist => artist.name).join(', '),
                count: 1,
              };
            } else {
              albumMap[albumId].count += 1;
            }
          });

          const albumList = Object.values(albumMap);
          albumList.sort((a, b) => b.count - a.count);
          setAlbums(albumList);
        })
        .catch(error => {
          console.error(error);
          setError('Une erreur est survenue lors de la récupération des données.');
        });
    }
    console.log('AccessToken State:', accessToken);
  }, [accessToken]);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };
  

  const handleLogout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    window.location.href = '/';
  };

  useEffect(() => {
    console.log('Selected Album:', selectedAlbum);
  }, [selectedAlbum]);

  return (
    <div>
      <Navbar
        accessToken={accessToken}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
      <div className="main-content">
        <div className="container">
          {!accessToken ? (
            <div className="login-prompt">
              {/* ...contenu de la page de connexion */}
            </div>
          ) : (
            <>
              <h2>Vos Albums/EPs les plus écoutés</h2>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <div className="album-grid">
                {albums.map((album, index) => (
                  <div
                    key={index}
                    className="album-card"
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <img src={album.image} alt={album.name} />
                    <h3>{album.name}</h3>
                    <p>{album.artist}</p>
                    <p>Morceaux dans le Top 50 : {album.count}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <AlbumDetails
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          accessToken={accessToken}
        />
      </div>
      <Footer />
    </div>
  );
}

export default App;