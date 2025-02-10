require('dotenv').config();
const prisma = require('./prismaClient');
const stripe = require('stripe')('sk_test_51QOcvUAuYNt6Tkf5Nyc6nGHeXFsZkgldoy1hwQkwrOXe48aATj3ObKX0t71pTZ9nLhHib7kDp9IlKV0xnpXobjxo00l6Cd3NWx');

module.exports.createAndSaveCoupon = async function createAndSaveCoupon(name, discount, discountType, duration, durationInMonths) {
  try {
    const couponData = {
      name: name,
      percent_off: discountType === "percentage" ? discount : undefined,
      amount_off: discountType === "fixed"  ? discount *100 : undefined,
      currency: discountType === "fixed" ? "sgd" : undefined,
      duration: duration,
    };

    if (duration === "repeating" && durationInMonths) {
      couponData.duration_in_months = durationInMonths;
    }

    const coupon = await stripe.coupons.create(couponData);
    
    const savedCoupon = {
      stripeId: coupon.id,
      name: coupon.name,
      duration: coupon.duration,
      durationMonths: coupon.duration_in_months || null,
      percentOff: coupon.percent_off || null,
      amountOff: coupon.amount_off/100 || null,
      currency: coupon.currency || "sgd",
      createdAt: new Date(coupon.created * 1000),
      redeemBy: coupon.redeem_by ? new Date(coupon.redeem_by * 1000) : null,
      timesRedeemed: 0, // Start from 0 as Stripe doesn’t track redemptions automatically
      valid: coupon.valid,
    };

    const localCoupon = await prisma.coupon.create({
      data: savedCoupon
    });

    console.log('Coupon saved successfully:', localCoupon);
    return localCoupon;
  } catch (error) {
    console.error('Error creating and saving coupon:', error);
    throw error;
  }
};

module.exports.getCouponById = async function getCouponById(couponId) {
  try {
    const coupon = await stripe.coupons.retrieve(couponId);
    console.log('Retrieved Coupon:', coupon);
    return coupon;
  } catch (error) {
    console.error('Error retrieving coupon:', error);
    throw error;
  }
};

module.exports.getAllValidCoupons = async function getAllValidCoupons() {
  try {
    const availableCoupons = await prisma.coupon.findMany({
      where: { valid: true },
    });
    console.log('Available Coupons:', availableCoupons);
    return availableCoupons;
  } catch (error) {
    console.error('Error retrieving coupons:', error);
    throw error;
  }
};

module.exports.redeemCoupon = async function redeemCoupon(couponId) {
  try {
    const localCoupon = await prisma.coupon.findUnique({
      where: { stripeId: couponId }
    });

    if (!localCoupon || !localCoupon.valid) {
      console.log('Coupon is invalid or expired.');
      return { success: false, message: 'Coupon is invalid or expired.' };
    }

    // Update timesRedeemed manually since Stripe does not track this
    const updatedCoupon = await prisma.coupon.update({
      where: { stripeId: couponId },
      data: { timesRedeemed: localCoupon.timesRedeemed + 1 },
    });

    console.log('Coupon redeemed successfully:', updatedCoupon);
    return { success: true, message: 'Coupon redeemed!', coupon: updatedCoupon };
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    throw error;
  }
};

module.exports.deleteCoupon = async function deleteCoupon(couponId) {
  try {
    const deleted = await stripe.coupons.del(couponId);
    await prisma.coupon.delete({ where: { stripeId: couponId } });

    console.log('Coupon deleted successfully:', deleted);
    return { success: true, message: 'Coupon deleted!', deleted };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};
