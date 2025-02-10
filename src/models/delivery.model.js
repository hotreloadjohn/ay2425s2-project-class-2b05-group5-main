const prisma = require('./prismaClient'); // Ensure you import your Prisma client

module.exports.createDeliveryForm = async function createDeliveryForm({ deliveryType, collectionPointId, name, address, unit, postalCode, phoneNumber, orderId, deliveryNo, notes }) {
  try {
    // Prepare delivery data
    const deliveryData = {
      orderId,
      deliveryNo,
      name,
      address,
      unit,
      postalCode,
      phoneNumber,
      notes,
      deliveryType,  // Either 'DIRECT' or 'COLLECTION'
      collectionPointId: deliveryType === 'COLLECTION' ? collectionPointId : null, // Only include collectionPointId if the delivery type is 'COLLECTION'
      deliveryStartDate: new Date(),
      deliveredDate: null, // This will be updated when the order is delivered
      status: 'PENDING' // You can adjust the default status if needed
    };

    // Create a new delivery record in the database using Prisma
    const newDelivery = await prisma.delivery.create({
      data: deliveryData
    });

    return { success: true, delivery: newDelivery };  // Return the created delivery data

  } catch (error) {
    console.error('Error creating delivery form:', error);
    throw new Error('Error creating delivery form');
  }
};


module.exports.getAllDeliveryData = async function getAllDeliveryData() {
  let results = prisma.delivery.findMany();
  return results;
}

module.exports.updateDeliveryStatus = async function updateDeliveryStatus(orderId, status) {
  try {
    // Fetch the delivery record by orderId (as it's not unique, we use findFirst)
    const delivery = await prisma.delivery.findFirst({
      where: { orderId: orderId }, // Find the first delivery associated with the orderId
    });

    // Check if the delivery exists
    if (!delivery) {
      return { message: 'Delivery not found for the given order.' };
    }

    // Check if the status is "DELIVERED"
    if (status === 'DELIVERED') {
      if (delivery.status !== 'DELIVERED') {
        // If the delivery is not already delivered, update the deliveredDate
        const updatedDelivery = await prisma.delivery.update({
          where: { id: delivery.id }, // Use delivery.id to uniquely identify the record
          data: {
            status: 'DELIVERED',
            deliveredDate: new Date(), // Set the deliveredDate to the current date
          },
        });
        return updatedDelivery;
      } else {
        // If it's already delivered, return a message saying it's already delivered
        return { message: 'Delivery is already marked as delivered.' };
      }
    } else {
      // If the status isn't "DELIVERED", just update the status without changing the deliveredDate
      const updatedDelivery = await prisma.delivery.update({
        where: { id: delivery.id }, // Use delivery.id to uniquely identify the record
        data: {
          status: status, // Update the status without affecting deliveredDate
        },
      });
      return updatedDelivery;
    }
  } catch (error) {
    // Catch any error and throw a more descriptive message
    throw new Error('Error updating delivery status: ' + error.message);
  }
};

module.exports.trackOrderByTrackingNo = async function trackOrderByTrackingNo(trackingNo) {
  try {
    const delivery = await prisma.delivery.findFirst({
      where: {
        deliveryNo: trackingNo, // Ensure deliveryNo is unique
      },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: true, // Include product details if needed
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return { error: "Tracking number not found." };
    }

    return delivery;
  } catch (error) {
    console.error("Error tracking order:", error);
    return { error: "An error occurred while tracking the order." };
  }
};

module.exports.createRefundRequest = async function createRefundRequest({ orderId, issueType, issueDescription, trackingNumber, proofImages }) {
  try {
    // Example: Assuming you are using a database like MongoDB or PostgreSQL, you can save the refund request in the database
    const refundRequest = {
      orderId,
      issueType,
      issueDescription,
      proofImages: JSON.stringify(proofImages.map((file) => ({
        filename: file.filename,
        path: file.path,
        size: file.size
    }))),
      status: 'PENDING', // You can change this based on your business logic
      createdAt: new Date(),
    };

    // Example: Save the refund request to the database
    const result = await prisma.refundRequest.create({
      data: refundRequest
    });
    return result;
  } catch (error) {
    throw new Error('Error creating refund request: ' + error.message);
  }
};

module.exports.getRefundDataById = async function getRefundDataById(orderId) {
  try {
    if (!orderId) {
      throw new Error('OrderId is required');
    }

    console.log('Fetching refund data for orderId:', orderId);

    // Fetch the refund request based on the orderId
    const refundData = await prisma.refundRequest.findUnique({
      where: {
        orderId: orderId, // Use the orderId to find the corresponding refund request
      },
    });

    if (!refundData) {
      const error = new Error('Refund history not found for this order.');
      error.status = 404;
      throw error;
    }

    // Fetch the delivery details using the orderId from the refundData
    const deliveryData = await prisma.delivery.findFirst({
      where: {
        orderId: refundData.orderId, // Use the orderId from the refundData to fetch the delivery info
      },
      select: {
        deliveryNo: true, // Get the delivery number (tracking number)
      },
    });

    if (!deliveryData) {
      const error = new Error('Delivery data not found for this order.');
      error.status = 404;
      throw error;
    }

    // Combine both refund and delivery data
    refundData.deliveryNo = deliveryData.deliveryNo;

    console.log(refundData);
    return refundData;
  } catch (error) {
    console.error('Error retrieving refund data:', error);
    throw error;
  }
};

module.exports.getAllRefundData = async function getAllRefundData() {
  try {
    const refundData = await prisma.refundRequest.findMany({
      include: {
        order: {
          include: {
            delivery: { 
              select: {
                deliveryNo: true
              }
            }
          }
        }
      }
    });

    return refundData.map(refund => ({
      id: refund.id,
      orderId: refund.orderId,
      deliveryNo: refund.order.delivery.length > 0 
        ? refund.order.delivery[0].deliveryNo // Use the first delivery's number
        : '-', // Default if no delivery data
      issueType: refund.issueType,
      issueDescription: refund.issueDescription || '-',
      proofImages: refund.proofImages || '[]', // Default to empty array string
      status: refund.status,
      createdAt: refund.createdAt,
      updatedAt: refund.updatedAt || '-',
      reason: refund.reason || '-'
    }));

  } catch (error) {
    console.error("Error fetching refund data:", error);
    throw error;
  }
};

module.exports.updateRefundData = async function updateRefundData(refundId, status, reason) {
  try {
    const updatedRefund = await prisma.refundRequest.update({
      where: {
        id: parseInt(refundId, 10),
      },
      data: {
        status: status,
        reason: reason,
        updatedAt: new Date(), // Update updatedAt to the current date and time
      },
    });
    return updatedRefund;
  } catch (error) {
    console.error("Error updating refund data:", error);
    throw error;
  }
};