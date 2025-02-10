const express = require('express');
const router = express.Router();
const upload = require('../middlewares/fileUpload');
const { createDeliveryForm, getAllDeliveryData, updateDeliveryStatus, trackOrderByTrackingNo, createRefundRequest, getRefundDataById, getAllRefundData, updateRefundData } = require('../models/delivery.model');
const { delivery } = require('../models/prismaClient');

router.post('/createDeliveryForm', (req, res, next) => {
    const { deliveryType, collectionPointId, name, address, unit, postalCode, phoneNumber, orderId, deliveryNo, notes } = req.body;

    // Call the function to create the delivery in the database
    createDeliveryForm({ deliveryType, collectionPointId, name, address, unit, postalCode, phoneNumber, orderId, deliveryNo, notes })
        .then((data) => res.status(200).json(data))
        .catch(next);
});

router.get('/getAllDeliveryData', async (req, res, next) => {

  try {
    getAllDeliveryData()
      .then((result) => res.status(200).json(result))

  } catch (error) {
    next(error);
  }
});

router.put('/updateStatus/:id', async (req, res, next) => {
  let orderId = Number(req.params.id);
  let status = req.body.status;
  try {
    updateDeliveryStatus(orderId,status)
      .then((result) => res.status(200).json(result))

  } catch (error) {
    next(error);
  }
});

router.get('/trackingOrder/:id', async (req, res, next) => {
  let trackingNo = req.params.id;
  try {
    trackOrderByTrackingNo(trackingNo)
      .then((result) => res.status(200).json(result))

  } catch (error) {
    next(error);
  }
});

router.post('/return/:orderId', upload, (req, res, next) => {
  const orderId = Number(req.params.orderId);
  const { issueType, issueDescription, trackingNumber } = req.body;
  const proofImages = req.files; 

  if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number is required.' });
  }

  if (!proofImages || proofImages.length === 0) {
      return res.status(400).json({ message: 'At least one proof image is required.' });
  }

  createRefundRequest({
      orderId,
      issueType,
      issueDescription,
      trackingNumber,
      proofImages
  })
      .then((data) => res.status(200).json(data))
      .catch(next);
});

router.get('/getRefundData/:id', async (req, res, next) => {
  const orderId = parseInt(req.params.id, 10);
  try {
    const result = await getRefundDataById(orderId);
    res.status(200).json(result);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

router.get('/getRefundData', async (req, res, next) => {
  try {
    const result = await getAllRefundData();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/updateRefundStatus/:refundId', async (req, res, next) => {
  const refundId = req.params.refundId;
  const { status, reason } = req.body;
  try {
    await updateRefundData(refundId, status, reason);
    res.status(204).json(); // No content response
  } catch (error) {
    next(error);
  }
});




module.exports = router;
