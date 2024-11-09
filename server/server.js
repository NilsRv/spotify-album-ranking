const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
app.use(cors());

const client_id = '3c790c771d7c43d8bbcf355d98bfcae2';
const client_secret = 'cafc356e59104a8a8ca693267f32ba38';
const redirect_uri = 'http://localhost:8888/callback'; // Modifié ici

app.get('/login', (req, res) => {
  const scope = 'user-top-read';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
      })
  );
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirect_uri, // Doit correspondre au redirect_uri ci-dessus
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
  })
    .then(response => {
      const { access_token, refresh_token } = response.data;
      const queryParams = querystring.stringify({
        access_token,
        refresh_token,
      });
      res.redirect(`http://localhost:3000/?${queryParams}`); // Redirige vers le frontend avec les tokens
    })
    .catch(error => {
      res.send(error);
    });
});

app.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
  })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.send(error);
    });
});

const port = 8888;
app.listen(port, () => {
  console.log(`Serveur Express en écoute sur http://localhost:${port}`);
});