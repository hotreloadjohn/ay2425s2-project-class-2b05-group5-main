const express = require('express');
const { createOrUpdateWishlistItem, getAllWishlistItems, deleteWishlistItem, getPriceDropNotifications } = require('../models/wishlistModel');
// const stripe = require('stripe')('sk_test_51QOcvUAuYNt6Tkf5Nyc6nGHeXFsZkgldoy1hwQkwrOXe48aATj3ObKX0t71pTZ9nLhHib7kDp9IlKV0xnpXobjxo00l6Cd3NWx');
// const prisma = require('../models/prismaClient');
const router = express.Router();

// Add or Update Wishlist Item
router.post('/create', async (req, res) => {
  try {
    const { productId, personId } = req.body;
    if (!productId || !personId) {
      return res.status(400).json({ error: 'Missing required fields: productId or personId' });
    }

    const wishlistItem = await createOrUpdateWishlistItem(productId, personId);
    return res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Error adding item to wishlist:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Get All Wishlist Items
router.get('/:personId', async (req, res, next) => {
  const personId = parseInt(req.params.personId, 10);

  try {
    const wishlistItems = await getAllWishlistItems(personId);
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    next(error);
  }
});

// Delete Wishlist Item
router.delete('/delete/:personId', async (req, res, next) => {
  const personId = parseInt(req.params.personId, 10);
  const productId = parseInt(req.body.productId, 10);

  if (!productId) {
    return res.status(400).json({ error: 'Missing required field: productId.' });
  }

  try {
    const deletedItem = await deleteWishlistItem(personId, productId);
    res.status(204).json(deletedItem);
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    next(error);
  }
});


// Get Price Drop Notifications
router.get('/notify/:personId', async (req, res, next) => {
  try {
    const personId = parseInt(req.params.personId, 10);
    const notifications = await getPriceDropNotifications(personId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching price drop notifications:', error);
    next(error);
  }
});


module.exports = router;
