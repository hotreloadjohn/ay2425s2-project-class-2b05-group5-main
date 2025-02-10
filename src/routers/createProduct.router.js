const express = require("express");
const router = express.Router();
const {
  CreateNewPro,
  updateProductById,
  deleteProductById,
  getAllProduct,
  getProductById,
  addStockToProduct,
  getExpiredStock, // Import getExpiredStock function
} = require("../models/CreateProduct.model");

// Create a new product
router.post("/create", (req, res, next) => {
  const { name, unitPrice,description,  stockQuantity, country, productType } = req.body;

  CreateNewPro( name,  unitPrice,description, stockQuantity, country, productType)
    .then((product) =>
      res.status(201).json({ message: `Product ${product.name} created successfully`, product })
    )
    .catch(next);
});

// Update a product by ID
router.put("/update/:id", (req, res, next) => {
  const { id } = req.params;
  const { name, description, unitPrice, country, productType } = req.body;

  updateProductById(parseInt(id), name, description, unitPrice, country, productType)
    .then((result) => res.status(200).json(result))
    .catch(next);
});

// Delete a product by ID
router.delete("/delete/:id", (req, res, next) => {
  const { id } = req.params;

  deleteProductById(parseInt(id))
    .then((product) =>
      res.status(200).json({ message: `Product ${product.id} deleted successfully`, product })
    )
    .catch(next);
});

// Get all products with sorting
router.get("/getAll", (req, res, next) => {
  const searchTerm = req.query.search || ""; // Default to empty string if no search term
  const sortBy = req.query.sort || ""; // Default to no sorting if not provided

  getAllProduct(searchTerm, sortBy)
    .then((products) => res.status(200).json(products))
    .catch(next);
});

// Get product by ID
router.get("/getById/:productId", (req, res, next) => {
  const productId = req.params.productId;
  console.log(productId); // Access productId from URL parameter
  getProductById(parseInt(productId))
    .then((product) => res.status(200).json(product)) // Return the specific product
    .catch(next); // Pass errors to middleware
});

// Get all expired stock
router.get("/expiredStock", (req, res, next) => {
  getExpiredStock()
    .then((expiredStock) => res.status(200).json(expiredStock))
    .catch(next);
});

// Add stock to an existing product
router.post("/addStock", (req, res, next) => {
  const { productId, quantity, expiryDate } = req.body;

  addStockToProduct(parseInt(productId), parseInt(quantity), expiryDate)
    .then((result) => res.status(200).json(result))
    .catch(next);
});

module.exports = router;
