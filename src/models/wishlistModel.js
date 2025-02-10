const prisma = require('./prismaClient');

// Create or Update Wishlist Item
module.exports.createOrUpdateWishlistItem = async function createOrUpdateWishlistItem(productId, personId) {
  try {
    // Find or create an active wishlist for the user
    let wishlist = await prisma.wishlist.findFirst({
      where: { personId: personId, isActive: true },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { personId: personId, isActive: true },
      });
    }

    // Retrieve product details to track its price
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if the item exists before using upsert
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        AND: [
          { wishlistId: wishlist.wishlistId },
          { productId: productId },
        ],
      },
    });

    let wishlistItem;

    if (existingWishlistItem) {
      // Update the existing wishlist item
      wishlistItem = await prisma.wishlistItem.update({
        where: { id: existingWishlistItem.id },
        data: {
          lastKnownPrice: product.unitPrice, // Update the lastKnownPrice
        },
      });
    } else {
      // Create a new wishlist item
      wishlistItem = await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.wishlistId,
          productId: productId,
          lastKnownPrice: product.unitPrice, 
        },
      });
    }

    // Calculate price difference dynamically
    const priceDifference =
      product.unitPrice - (product.lastKnownPrice || product.unitPrice);

    return {
      status: existingWishlistItem ? 'UPDATED' : 'CREATED',
      wishlistItem: {
        ...wishlistItem,
        priceDifference: priceDifference.toFixed(2), 
      },
    };
  } catch (error) {
    console.error('Error creating or updating wishlist item:', error);
    throw error;
  }
};

// Get All Items in Wishlist
module.exports.getAllWishlistItems = async function getAllWishlistItems(personId) {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        wishlist: {
          personId: personId,
          isActive: true,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
            stockQuantity: true,
            lastKnownPrice: true
          },
        },
      },
    });

    // Map through wishlist items and calculate price difference dynamically
    const formattedItems = wishlistItems.map(item => {
      const priceDifference =
        item.lastKnownPrice && item.lastKnownPrice > item.product.unitPrice
          ? (item.lastKnownPrice - item.product.unitPrice).toFixed(2)
          : 0;

      return {
        productId: item.product.id,
        name: item.product.name,
        currentPrice: item.product.unitPrice,
        lastKnownPrice: item.product.lastKnownPrice,
        priceDifference: priceDifference,
        isInStock: item.product.stockQuantity > 0,
      };
    });

    return formattedItems;
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    throw error;
  }
};

// Delete Wishlist Item
module.exports.deleteWishlistItem = async function deleteWishlistItem(personId, productId) {
  try {
    const wishlist = await prisma.wishlist.findFirst({
      where: { personId: personId, isActive: true },
    });

    if (!wishlist) {
      throw new Error('No active wishlist found for this user');
    }

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.wishlistId, productId: productId },
    });

    if (!wishlistItem) {
      throw new Error('Wishlist item not found');
    }

    const deletedWishlistItem = await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    console.log(`Item with productId ${productId} deleted from wishlist ${wishlist.wishlistId}`);
    return deletedWishlistItem;
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    throw error;
  }
};

// Get Price Drop Notifications
module.exports.getPriceDropNotifications = async function getPriceDropNotifications(personId) {
  try {
      const wishlistItems = await prisma.wishlistItem.findMany({
          where: {
              wishlist: {
                  personId: personId,
                  isActive: true,
              },
          },
          include: {
              product: true,
          },
      });

      // Filter items with price drops
      const priceDropNotifications = wishlistItems
          .filter(item => item.product.lastKnownPrice > item.product.unitPrice)
          .map(item => ({
              name: item.product.name,
              priceDifference: (item.product.lastKnownPrice - item.product.unitPrice).toFixed(2),
              oldPrice: item.product.lastKnownPrice,
              newPrice: item.product.unitPrice,
          }));

      return priceDropNotifications;
  } catch (error) {
      console.error('Error fetching price drop notifications:', error);
      throw error;
  }
};
