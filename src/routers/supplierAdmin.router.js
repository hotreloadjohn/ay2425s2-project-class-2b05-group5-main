const express = require('express');
const router = express.Router();
const { addNewSuAdmin, deleteSuAdminById,FindSupplierAdminByPersonId } = require('../models/supplierAdmin.model');

// Create a new supplier admin
router.post('/create', (req, res, next) => {
    const {personId} = req.body;
    addNewSuAdmin(personId)
      .then((suAdmin) => res.status(201).json({ message: `Create supplier Admin ${suAdmin.personId} successfully` }))
      .catch(next);
  });
  
//delete supplier admin 
router.delete('/delete', (req, res, next) => {
    const { id } = req.body;
    deleteSuAdminById(parseInt(id))
      .then((suAdmin) => res.status(200).json({ message: `Delete supplier Admin ${suAdmin.id} successfully` }))
      .catch(next);
  });

  //get supplier admin by person Id
  router.get('/Check/:personId', async (req, res) => {
    const { personId } = req.params;

    if (!personId) {
        return res.status(400).json({ message: 'Person ID is required.' });
    }

    try {
        const supplierAdmins = await FindSupplierAdminByPersonId(parseInt(personId));

        if (!supplierAdmins || supplierAdmins.length === 0) {
            return res.status(404).json({ message: `No supplier admins found for personId: ${personId}.` });
        }

        res.json(supplierAdmins); // Return the supplier admin details
    } catch (error) {
        console.error('Error fetching supplier admin:', error.message);
        res.status(500).json({ error: error.message });
    }
});
  module.exports = router;