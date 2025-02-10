const express = require('express');
const router = express.Router();

const {getAllLocations} = require('../models/collectionPoint.model');

router.get('/:postalCode', (req, res) => {
  const userPostalCode = req.params.postalCode; 
    getAllLocations(userPostalCode)
      .then((data) => res.status(200).json(data))
  });


  
module.exports = router;