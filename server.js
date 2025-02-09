const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper function for HTTPS requests
const makeHttpsRequest = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', reject);
        }).on('error', reject);
    });
};

app.get("/favicon.ico", (req, res) => {
    res.status(204).end(); // Respond with "No Content" to prevent errors
});

// API endpoints
app.get('/api/weather-key', (req, res) => {
    if (!process.env.WEATHER_API_KEY) {
        return res.status(500).json({ error: 'Weather API key not configured' });
    }
    res.json({ WEATHER_API_KEY: process.env.WEATHER_API_KEY });
});

app.get('/api/geocode', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City parameter is required' });

    try {
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&apiKey=${process.env.GEOAPIFY_API_KEY}`;
        const data = await makeHttpsRequest(url);
        res.json(data);
    } catch (error) {
        console.error('Geocoding error:', error.message);
        res.status(500).json({ error: 'Failed to fetch geocoding data' });
    }
});

app.get('/api/places', async (req, res) => {
    const { lon, lat } = req.query;
    if (!lon || !lat) return res.status(400).json({ error: 'Longitude and latitude are required' });

    try {
        const url = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},50000&limit=6&sort=importance&apiKey=${process.env.GEOAPIFY_API_KEY}`;
        const data = await makeHttpsRequest(url);
        res.json(data);
    } catch (error) {
        console.error('Places error:', error.message);
        res.status(500).json({ error: 'Failed to fetch places data' });
    }
});

app.get('/api/destination-images', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query parameter is required' });

    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15&client_id=${process.env.UNSPLASH_API_KEY}`;
        const data = await makeHttpsRequest(url);
        res.json(data.results);
    } catch (error) {
        console.error('Error fetching images:', error.message);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.get('/api/maps-key', (req, res) => {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: 'Google Maps API key not configured' });
    }
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
