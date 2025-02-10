const prisma = require('./prismaClient');

module.exports.getOrderHistory = async function getOrderHistory(userId) {
  try {
    const orders = await prisma.order.findMany({
      where: { personId: userId },
      select: {
        id: true, 
        sessionId: true,
        createdAt: true,
        orderItems: {
          select: {
            product: true // Only select product details
          }
        }
      }
    });

    const formattedOrders = orders.map(order => ({
      orderId: order.id,
      sessionId: order.sessionId,
      createdAt: order.createdAt,
      products: order.orderItems.map(item => ({
        productId: item.product.id,  // Add product ID if needed
        productName: item.product.name,
        productPrice: item.product.unitPrice,
        productDescription: item.product.description,
        quantity: item.product.stockQuantity,
        imageUrl: item.product.imageUrl,  // Include product image
        manufacturedOn: new Date(item.product.manufacturedOn).toDateString() // Format date
      }))
    }));

    // Return the formatted orders data
    return formattedOrders;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
}


module.exports.getOrderIdBySessionId = async function getOrderIdBySessionId(sessionIdInput) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        sessionId: sessionIdInput,
      },
    });

    if (!order) {
      return null;
    }

    return order.id; // Return the `order_id` 
  } catch (error) {
    console.error('Error fetching order by sessionId:', error);
    throw error;
  }
};

module.exports.getOrderDetailsByOrderId = async function getOrderDetailsByOrderId(orderId) {
  try {
    // Fetch the order with the related order items, product details, and delivery information
    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId), // Ensure the id is a number
      },
      include: {
        orderItems: {
          include: {
            product: true, // Include the product details
          },
        },
        delivery: {
          include: {
            collectionPoint: true, // Include the collection point details
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found.');
    }

    // Calculate total price for each product and add it to the order items
    const orderItemsWithTotalPrice = order.orderItems.map(item => {
      const totalPrice = item.quantity * item.product.unitPrice; // Calculate total price for each item
      return {
        productName: item.product.name,
        productDetail: item.product.description, // Assuming 'description' is the product detail field
        quantity: item.quantity,
        unitPrice: item.product.unitPrice,
        totalPrice: totalPrice.toFixed(2), // Format total price
        productImage: item.product.imageUrl, // Format total price
      };
    });

    // Calculate final total amount
    const finalAmount = orderItemsWithTotalPrice.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0).toFixed(2);

    // Get delivery information
    const deliveryDetails = order.delivery.map(delivery => ({
      deliveryNo: delivery.deliveryNo,
      deliveryType: delivery.deliveryType,
      deliveryStartDate: delivery.deliveryStartDate,
      deliveredDate: delivery.deliveredDate,
      deliveryStatus: delivery.status,
      // Extract collection point name, if available
      collectionPointName: delivery.collectionPoint ? delivery.collectionPoint.name : null, 
      collectionPointLocations: delivery.collectionPoint ? delivery.collectionPoint.location : null, 
    }));

    return {
      orderItems: orderItemsWithTotalPrice,
      finalAmount: finalAmount,
      deliveryDetails: deliveryDetails,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
