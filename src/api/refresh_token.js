// src/api/refresh_token.js

const axios = require('axios');
const querystring = require('querystring');

export default async function handler(req, res) {
  const refresh_token = req.query.refresh_token;
  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;

  try {
    const response = await axios({
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
    });

    res.json(response.data);
  } catch (error) {
    res.send(error);
  }
}
