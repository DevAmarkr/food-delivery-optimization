const axios = require('axios');

async function getDistanceMatrix(driverLatLng, customerPoints) {
  const origins = `${driverLatLng.lat},${driverLatLng.lng}`;
  const destinations = customerPoints
    .map(p => `${p.customer_lat},${p.customer_long}`)
    .join('|');

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;

  const response = await axios.get(url, {
    params: {
      origins,
      destinations,
      key: process.env.GOOGLE_API_KEY,
      mode: 'driving'
    }
  });

  return response.data;
}

module.exports = { getDistanceMatrix };