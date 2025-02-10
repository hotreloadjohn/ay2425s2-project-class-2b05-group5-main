const express = require("express");
const router = express.Router();
const { createAndSaveCoupon, getAllValidCoupons, getCouponById, redeemCoupon, deleteCoupon } = require('../models/Coupons.model')

// Create a new coupon
router.post("/create", (req, res, next) => {
  const { name, discount, discountType, duration, durationInMonths } = req.body;
  createAndSaveCoupon(name, discount, discountType, duration, durationInMonths)
    .then((coupon) => res.status(201).json({ message: `Coupon ${coupon.stripeId} created successfully`, coupon }))
    .catch(next);
});

// Get all valid coupons
router.get("/getAll", (req, res, next) => {
  getAllValidCoupons()
    .then((coupons) => res.status(200).json(coupons))
    .catch(next);
});

// Get a coupon by ID
router.get("/getById/:couponId", (req, res, next) => {
  const { couponId } = req.params;
  getCouponById(couponId)
    .then((coupon) => res.status(200).json(coupon))
    .catch(next);
});

// Redeem a coupon
router.post("/redeem/:couponId", (req, res, next) => {
  const { couponId } = req.params;
  redeemCoupon(couponId)
    .then((updatedCoupon) => res.status(200).json({ message: "Coupon redeemed!", updatedCoupon }))
    .catch(next);
});

// Delete a coupon
router.delete("/delete/:id", (req, res, next) => {
  const { id } = req.params;
  deleteCoupon(id)
    .then((deletedCoupon) => res.status(200).json({ message: `Coupon ${id} deleted successfully`, deletedCoupon }))
    .catch(next);
});

module.exports = router;
