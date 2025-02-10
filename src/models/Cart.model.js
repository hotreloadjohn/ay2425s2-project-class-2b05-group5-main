const prisma = require('./prismaClient');

module.exports.createSingleCartItem = async function createSingleCartItem(productId, personId, quantity) {
  return prisma.cart.findFirst({
    where: {
      personId: personId,
      isActive: true,
    },
  })
    .then(cart => {
      if (!cart) {

        return prisma.cart.create({
          data: {
            personId: personId, 
          },
        });
      }
      return cart;
    })
    .then(cart => {
      return prisma.cartitem.findFirst({
        where: {
          cartId: cart.cartId, 
          productId: productId, 
        },
      })
        .then(existingCartItem => {
          if (existingCartItem) {

            const updatedQuantity = existingCartItem.quantity + quantity;

            return prisma.cartitem.update({
              where: {
                id: existingCartItem.id, 
              },
              data: {
                quantity: updatedQuantity,
              },
            })
              .then(updatedCartItem => {
                return { status: 'UPDATED', cartItem: updatedCartItem };
              });
          } else {
            return prisma.cartitem.create({
              data: {
                cartId: cart.cartId,
                productId: productId,
                quantity: quantity,
              },
            })
              .then(newCartItem => {
                return { status: 'CREATED', cartItem: newCartItem };
              });
          }
        });
    })
    .catch(error => {
      console.error('Error creating or updating cart item:', error);
      throw error;
    });
};



module.exports.getAllItemsInCart = async function getAllItemsInCart(personId) {
  try {
    const cartSummary = await prisma.cartitem.aggregate({
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      where: {
        cart: {
          personId: personId,
          isActive: true,
        },
      },
    });

    const totalPriceResult = await prisma.cartitem.findMany({
      select: {
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
          },
        },
      },
      where: {
        cart: {
          personId: personId,
          isActive: true,
        },
      },
      orderBy: {
        productId: 'asc', 
      },
    });

    const totalPrice = totalPriceResult.reduce(
      (sum, item) => sum + item.quantity * item.product.unitPrice,
      0
    );

    const productDetails = totalPriceResult.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.unitPrice,
      totalPrice: item.quantity * item.product.unitPrice,
    }));

    return {
      totalQuantity: cartSummary._sum.quantity || 0, 
      totalPrice: totalPrice,
      productCount: cartSummary._count.productId,
      products: productDetails,
    };
  } catch (error) {
    console.error('Error getting cart summary:', error);
    throw error;
  }
};

module.exports.updateItem = async function updateItem(userId, productId, quantity) {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        personId: userId,
        isActive: true, 
      },
      select: {
        cartId: true,
      },
    });

    if (!cart) {
      throw new Error(`No active cart found for userId: ${userId}`);
    }

    const cartId = cart.cartId;

    const existingCartItem = await prisma.cartitem.findFirst({
      where: {
        cartId: cartId,
        productId: productId,
      },
    });

    if (existingCartItem) {
      const updatedQuantity = quantity;

      const updatedCartItem = await prisma.cartitem.update({
        where: {
          id: existingCartItem.id, 
        },
        data: {
          quantity: updatedQuantity,
        },
      });

      return updatedCartItem;
    } else {
      const newCartItem = await prisma.cartitem.create({
        data: {
          cartId: cartId,
          productId: productId,
          quantity: quantity,
        },
      });

      return newCartItem;
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw new Error('Failed to update cart item.');
  }
};

module.exports.deleteCartItem = async function deleteCartItem(personId, productId) {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        personId: personId,
        isActive: true
      }
    });

    if (!cart) {
      throw new Error('No active cart found for this user');
    }

    const cartItem = await prisma.cartitem.findFirst({
      where: {
        cartId: cart.cartId,  
        productId: productId 
      }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    const deletedCartItem = await prisma.cartitem.delete({
      where: {
        id: cartItem.id 
      }
    });

    console.log(`Item with productId ${productId} deleted from cart ${cart.cartId}`);
    return deletedCartItem;
  } catch (error) {
    if (error.code === 'P2025') {
      console.error('Cart item not found for deletion');
      throw new Error('Cart item not found');
    }

    console.error('Error deleting cart item:', error);
    throw error; 
  }
};
