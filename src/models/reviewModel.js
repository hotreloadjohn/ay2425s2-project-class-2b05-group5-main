const prisma = require('./prismaClient');

// Create a review
module.exports.createReview = function createReview(productId, username, rating, text) {
    return prisma.review.create({
      data: {
        productId,  
        username,   
        rating,    
        text       
      },
    })
      .then((review) => {
        console.log("Review created:", review);
        return review;
      })
      .catch((error) => {
        console.error("Error creating review:", error);
        throw error;
      });
  };

// Fetch all reviews for a product
module.exports.getProductReviews = function getProductReviews(productId) {
  const filter = productId ? { productId: parseInt(productId, 10) } : {};

  return prisma.review.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { // Include related product data
        select: {
          name: true, // Include only the product name
        },
      },
    },
  });
};