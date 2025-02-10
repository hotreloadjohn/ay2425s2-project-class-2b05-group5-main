const express = require('express');
const router = express.Router();

const { getOrderHistory, getOrderIdBySessionId, getOrderDetailsByOrderId } = require('../models/orderHistory.model');

router.get('/:userId', (req, res, next) => {
  const userId = Number(req.params.userId);
  getOrderHistory(userId)
    .then((data) => res.status(200).json(data))
    .catch(next);
});

router.get('/order/:sessionId', async (req, res, next) => {
  const sessionId = req.params.sessionId;

  try {
    const orderId = await getOrderIdBySessionId(sessionId);
    if (!orderId) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json({ orderId });
  } catch (error) {
    next(error);
  }
});

router.get('/orderDetails/:orderId', async (req, res, next) => {
  const sessionId = req.params.orderId;

  try {
    const orderDetails = await getOrderDetailsByOrderId(sessionId); // Get order details
    
    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Return response in the correct format
    res.status(200).json(orderDetails);
  } catch (error) {
    next(error);
  }
});




module.exports = router;