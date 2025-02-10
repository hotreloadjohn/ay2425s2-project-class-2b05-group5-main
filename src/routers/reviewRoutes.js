const express = require('express');
const { createReview, getProductReviews } = require('../models/reviewModel');

const router = express.Router();

// Endpoint to create a review
router.post('/create', async (req, res) => {
  let { productId, username, rating, text } = req.body;

  // Parse productId and rating to integers
  productId = parseInt(productId, 10);
  rating = parseInt(rating, 10);

  // Validate input
  if (!productId || !rating || !text || !username) {
    return res.status(400).json({ message: 'All fields are required and must be valid.' });
  }

  // Debugging input data
  console.log('Received Data:', { productId, username, rating, text });

  try {
    const review = await createReview(productId, username, rating, text); 
    res.status(201).json({ message: 'Review created successfully.', review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'An error occurred while creating the review.' });
  }
});

// Endpoint to fetch all reviews
router.get('/', async (req, res) => {
  const { productId } = req.query;

  try {
    const reviews = await getProductReviews(productId);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'An error occurred while fetching reviews.' });
  }
});

module.exports = router;
