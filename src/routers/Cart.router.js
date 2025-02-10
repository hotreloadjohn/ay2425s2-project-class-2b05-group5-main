const express = require('express');
require('dotenv').config({ path: '.env.environment' });
const { createSingleCartItem } = require('../models/Cart.model');
const { getAllItemsInCart } = require('../models/Cart.model');
const { updateItem } = require('../models/Cart.model');
const { deleteCartItem } = require('../models/Cart.model');
const stripe = require('stripe')('sk_test_51QOcvUAuYNt6Tkf5Nyc6nGHeXFsZkgldoy1hwQkwrOXe48aATj3ObKX0t71pTZ9nLhHib7kDp9IlKV0xnpXobjxo00l6Cd3NWx');
const router = express.Router();
const prisma = require('../models/prismaClient')

router.post('/create', async (req, res, next) => {
  try {
    const { productId, personId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields: cartId, productId, or quantity.' });
    }
    const cartItem = await createSingleCartItem(productId, personId, quantity);
    return res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
});

router.get('/:personId', async (req, res) => {
  const personId = parseInt(req.params.personId);

  try {
    const cartSummary = await getAllItemsInCart(personId);
    res.status(200).json(cartSummary);
  } catch (error) {
    console.error('Error fetching cart summary:', error);
    res.status(500).json({ error: 'Failed to fetch cart summary' });
  }
});

router.put('/update/:userId', async (req, res) => {
  const quantity = req.body.quantity
  const productId = parseInt(req.body.productId, 10)
  const userId = parseInt(req.params.userId, 10);

  try {
    const updatedCartItem = await updateItem(userId, productId, quantity);
    res.status(200).json(updatedCartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item.' });
  }
});

router.delete('/delete/:personId', async (req, res) => {
  const personId = parseInt(req.params.personId, 10);
  const productId = parseInt(req.body.productId, 10);  // Correct the typo 'prodcutId' to 'productId'

  try {
    const deleteItem = await deleteCartItem(personId, productId);
    res.status(204).json(deleteItem);
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
});

router.post('/checkout/:personId', async (req, res) => {
  const personId = parseInt(req.params.personId, 10);
  const { selectedItemsInt, couponCode } = req.body; // Add couponCode from frontend

  if (!Array.isArray(selectedItemsInt) || selectedItemsInt.length === 0) {
    return res.status(400).json({ error: 'No items selected for checkout.' });
  }

  try {
    // Fetch the selected cart items along with stock information
    const cartItems = await prisma.cartitem.findMany({
      where: {
        productId: { in: selectedItemsInt },
        cart: { personId, isActive: true },
      },
      include: { product: true },
    });

    // Check stock availability
    const insufficientStockItems = cartItems.filter(item => item.quantity > item.product.stockQuantity);
    if (insufficientStockItems.length > 0) {
      return res.status(400).json({
        error: 'Some items do not have enough stock.',
        insufficientItems: insufficientStockItems.map(item => ({
          productName: item.product.name,
          requested: item.quantity,
          available: item.product.stockQuantity,
        })),
      });
    }

    // Prepare line items for Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'sgd',
        product_data: { name: item.product.name },
        unit_amount: Math.round(item.product.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

    // Validate the coupon
    let stripeCoupon = null;
    if (couponCode) {
      const couponExists = await prisma.coupon.findUnique({
        where: { stripeId: couponCode }
      });

      if (couponExists && couponExists.valid) {
        stripeCoupon = couponExists.stripeId; // Use Stripe's coupon ID
      }
    }

    // Create a Stripe Checkout Session with coupon
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      discounts: stripeCoupon ? [{ coupon: stripeCoupon }] : [], // Apply the coupon if valid
      success_url: `http://localhost:3000/payment/success.html?session_id={CHECKOUT_SESSION_ID}&personId=${personId}`,
      cancel_url: `http://localhost:3000/cart/cart.html`,
      metadata: { personId, selectedItems: selectedItemsInt.join(',') },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});



module.exports = router;
