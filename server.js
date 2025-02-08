const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static('public'));

// Weather API endpoint
app.get('/api/weather-key', (req, res) => {
    try {
        if (!process.env.WEATHER_API_KEY) {
            throw new Error('Weather API key not configured');
        }
        res.json({ WEATHER_API_KEY: process.env.WEATHER_API_KEY });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve API key' });
    }
});

// Geocoding endpoint
app.get('/api/geocode', async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        const response = await fetch(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&apiKey=${process.env.GEOAPIFY_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: 'Failed to fetch geocoding data' });
    }
});

// Places endpoint
app.get('/api/places', async (req, res) => {
    try {
        const { lon, lat } = req.query;
        if (!lon || !lat) {
            return res.status(400).json({ error: 'Longitude and latitude are required' });
        }

        const response = await fetch(
            `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},50000&limit=6&sort=importance&apiKey=${process.env.GEOAPIFY_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Places request failed');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Places error:', error);
        res.status(500).json({ error: 'Failed to fetch places data' });
    }
});

//Google Maps endpoint
app.get('/api/maps-key', (req, res) => {
    try {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key not configured');
        }
        res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve API key' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});