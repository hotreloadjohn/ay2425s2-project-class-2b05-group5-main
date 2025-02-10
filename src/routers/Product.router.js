const express = require('express');
const { getAllProduct } = require('../models/Product.model');
const { getsearchProduct } = require('../models/Product.model');
const { getProductById } = require('../models/Product.model');
const router = express.Router();

router.get('/', (req, res, next) => {
  getAllProduct()
    .then((product) => res.status(200).json(product))
    .catch(next);
});

router.get('/:searchProduct', (req, res, next) => {
  const searchProduct = req.params.searchProduct; // Access search term from URL parameter
  if (!searchProduct) {
    return res.status(400).json({ error: "Search term is required" });
  }

  getsearchProduct(searchProduct)
    .then((products) => res.status(200).json(products))  // Return matched products
    .catch(next); // Pass errors to middleware
});

router.get('/id/:productId', (req, res, next) => {
  const productId = req.params.productId; 
  console.log(productId);// Access productId from URL parameter
  getProductById(productId)
    .then((product) => res.status(200).json(product))  // Return the specific product
    .catch(next); // Pass errors to middleware
});


module.exports = router;