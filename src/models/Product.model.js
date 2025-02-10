const prisma = require('./prismaClient');

module.exports.getAllProduct = async function getAllProduct() {
  return prisma.product.findMany();
};

module.exports.getsearchProduct = async function getsearchProduct(searchProduct) {
  try {
    if (!searchProduct || typeof searchProduct !== 'string') {
      throw new Error("Invalid search term");
    }

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: searchProduct,
          mode: 'insensitive',
        },
      },
    });

    return products;
  } catch (error) {
    console.error("Error searching for products:", error);
    throw error;
  }
};


module.exports.getProductById = async function getProductById(productId) {
  try {
    // Fetch the product by its ID
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(productId, 10), // Convert to integer to ensure compatibility
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }
 
    return product; // Return the product
  } catch (error) {
    console.error('Error retrieving product by ID:', error.message);
    throw error; // Rethrow the error for the caller to handle
  }
};