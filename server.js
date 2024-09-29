require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

const unsplashApiUrl = 'https://api.unsplash.com';

// Create an axios instance with default configuration
const unsplashApi = axios.create({
  baseURL: unsplashApiUrl,
  headers: {
    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
  }
});

app.get('/wallpapers', async (req, res) => {
  try {
    const { 
      query = 'wallpaper', 
      category, 
      page = 1, 
      per_page = 10, 
      orientation, 
      color, 
      order_by 
    } = req.query;
    
    let searchQuery = query;
    if (category) {
      searchQuery += ` ${category}`;
    }

    // Create a base params object
    const params = {
      query: searchQuery,
      page,
      per_page,
    };

    // Add optional parameters only if they are present in req.query
    if (orientation) params.orientation = orientation;
    if (color) params.color = color;
    if (order_by) params.order_by = order_by;

    const response = await unsplashApi.get('/search/photos', { params });

    const wallpapers = response.data.results.map(photo => ({
      id: photo.id,
      description: photo.description,
      url: photo.urls.regular,
      thumb: photo.urls.thumb,
      user: {
        name: photo.user.name,
        username: photo.user.username,
      },
    }));

    res.json(wallpapers);
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    res.status(500).json({ error: 'An error occurred while fetching wallpapers' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});