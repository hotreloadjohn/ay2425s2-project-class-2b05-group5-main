const prisma = require("./prismaClient");

module.exports.getAllProduct = async function getAllProduct(
  searchTerm,
  sortBy
) {
  try {
    const now = new Date();

    // Get expired stock products
    const expiredStock = await prisma.productStock.findMany({
      where: {
        expiryDate: { lte: new Date(now.setDate(now.getDate() + 5)) },
        isAvailable: false,
      },
    });

    let expiredProducts = [];
    if (expiredStock.length > 0) {
      expiredProducts = expiredStock.map((stock) => stock.productId);
    }

    // Update expired stock to unavailable
    await prisma.productStock.updateMany({
      where: {
        expiryDate: { lte: new Date(now.setDate(now.getDate() + 5)) }, // Expired 5 days before
        isAvailable: true,
      },
      data: { isAvailable: false },
    });

    // Search functionality
    let searchFilter = {};
    if (searchTerm) {
      searchFilter = {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      };
    }

    // Sorting functionality
    let orderBy = [];
    if (sortBy === "price-asc") {
      orderBy = [{ unitPrice: "asc" }];
    } else if (sortBy === "price-desc") {
      orderBy = [{ unitPrice: "desc" }];
    } else if (sortBy === "stock-asc") {
      orderBy = [{ stockQuantity: "asc" }];
    } else if (sortBy === "stock-desc") {
      orderBy = [{ stockQuantity: "desc" }];
    }

    // Fetch products with filters and sorting
    const products = await prisma.product.findMany({
      where: searchFilter,
      orderBy: orderBy,
      include: {
        stock: {
          where: {
            isAvailable: true, // Only include stock that is available
            expiryDate: { gte: new Date() }, // Include only non-expired stock
          },
        },
      },
    });

    // Add up the stock quantities for each product
    const updatedProducts = products.map((product) => {
      // Sum the stock from ProductStock table (non-expired) and product stockQuantity
      const additionalStock = product.stock.reduce(
        (sum, stockItem) => sum + parseInt(stockItem.quantity),
        0
      );
      const totalStock =
        (parseInt(product.stockQuantity) || 0) + parseInt(additionalStock); // Include product's own stock quantity
      return {
        ...product,
        totalStock, // Add the computed total stock field
      };
    });

    return updatedProducts;
  } catch (error) {
    console.error("Error retrieving products:", error.message);
    throw error;
  }
};

// Add stock to an existing product
module.exports.addStockToProduct = async function addStockToProduct(
  productId,
  quantity,
  expiryDate
) {
  try {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    await prisma.productStock.create({
      data: {
        productId,
        quantity,
        expiryDate: new Date(expiryDate),
        isAvailable: true,
      },
    });

    console.log(`Stock added to product ${productId}.`);
    return { message: "Stock added successfully." };
  } catch (error) {
    console.error("Error adding stock:", error.message);
    throw error;
  }
};

// Notify suppliers of expired stock
module.exports.getExpiredStock = async function getExpiredStock() {
  try {
    const expiredStock = await prisma.productStock.findMany({
      where: { isAvailable: false },
      include: { product: true },
    });
    return expiredStock;
  } catch (error) {
    console.error("Error retrieving expired stock:", error.message);
    throw error;
  }
};

// Create new product

module.exports.CreateNewPro = async function CreateNewPro(
  name,
  unitPrice,
  description,
  stockQuantity,
  country,
  productType
) {
  try {
    if (!Number.isInteger(stockQuantity) || stockQuantity <= 0) {
      throw new Error(
        `Quantity ${stockQuantity} is invalid, please enter a positive integer greater than 0`
      );
    }
    if (unitPrice <= 0) {
      throw new Error(
        `Unit price ${unitPrice} is invalid, price should be greater than 0`
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        unitPrice,
        description,
        stockQuantity,
        country,
        productType,
      },
    });

    console.log("Product created:", product);
    return product;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw error;
  }
};

// Update product by product ID
module.exports.updateProductById = async function updateProductById(
  Id,
  name,
  description,
  unitPrice,
  country,
  productType
) {
  const result = await prisma.product.updateMany({
    where: { id: Id },
    data: { name, description, unitPrice, country, productType },
  });

  if (result.count === 0) {
    throw new Error("Product not found.");
  }
  console.log(`Product ${Id} updated successfully.`);
  return { message: "Product updated successfully." };
};

// Delete product by product ID
module.exports.deleteProductById = async function deleteProductById(productId) {
  const product = await prisma.product.delete({
    where: { id: productId },
  });
  console.log("Product deleted:", product);
  return product;
};

// Get product by ID
module.exports.getProductById = async function getProductById(productId) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
  });

  if (!product) {
    throw new Error(`Product with ID ${productId} not found.`);
  }

  return product;
};
