const express = require('express');
const {
  addNewSuApply,
  editSuApply,
  deleteSupplierApply,
  updateSuApplyStatus,
  getSupplierApplications,
  addNewSupplier,
  getPendSuApplyListByid,
  getSupplierCountByCompany,
  getSupplierApplicationsById,
  getSupplierById
} = require('../models/supplier.model');

const router = express.Router();

// Create a new supplier application
router.post('/application/create', (req, res, next) => {
  const  { personId, companyName, productType, Reason } = req.body;
  console.log('Received request to create supplier:', Reason);
  addNewSuApply(personId, companyName, productType, Reason)
    .then((suApply) => res.status(201).json({ message: `Created supplier application for user ${suApply.personId} successfully.` }))
    .catch(next);
});

// Edit a supplier application
router.put('/application/edit', (req, res, next) => {
  const { suapplyId, personId, companyName, productType, Reasonforapply } = req.body;
  editSuApply(suapplyId, personId, companyName, productType, Reasonforapply)
    .then((response) => res.status(200).json(response))
    .catch(next);
});

// Delete a supplier application
router.delete('/application/delete', (req, res, next) => {
  const { suApplyId, personId } = req.body;
  deleteSupplierApply(suApplyId, personId)
    .then((application) => res.status(200).json({ message: 'Supplier application deleted successfully.', application }))
    .catch(next);
});

// Update supplier application status
router.put('/application/status/:suapplyId/:status', (req, res, next) => {
  const suapplyId = req.params.suapplyId;
  const status = req.params.status;
  const adminreason = req.body.adminreason;
  updateSuApplyStatus(suapplyId, status,adminreason)
    .then((application) =>
      res
        .status(200)
        .json({ message: 'Application status updated successfully.', application })
    )
    .catch(next);
});

// Get all pending supplier applications
router.get('/application/all', (req, res, next) => {
  const { status, search } = req.query;

  getSupplierApplications(status, search)
    .then((applications) => res.status(200).json(applications))
    .catch(next);
});

//get supplier apply by suApplier apply id
router.get('/application/details/:suapplyId', (req, res, next) => {
  const ID = req.params.suapplyId
  getPendSuApplyListByid(ID)
    .then((applications) => res.status(200).json(applications))
    .catch(next);
});
// Add a new supplier
router.post('/create', (req, res, next) => {
  const { personId, companyName, productType, supplierAdminId } = req.body;
  addNewSupplier(personId, companyName, productType, supplierAdminId)
    .then((supplier) => res.status(201).json({ message: 'New supplier added successfully.', supplier }))
    .catch(next);
});
// Get supplier count by company
router.get('/countByCompany', (req, res, next) => {
  getSupplierCountByCompany()
    .then((supplierCountByCompany) => {
      res.status(200).json(supplierCountByCompany);
    })
    .catch(next);
});
// Get supplier stats (total, approved, rejected)
router.get('/stats', async (req, res, next) => {
  try {
    const total = await getSupplierApplications(); // Fetch all
    const approved = await getSupplierApplications('approved');
    const rejected = await getSupplierApplications('rejected');

    res.status(200).json({
      total: total.length,
      approved: approved.length,
      rejected: rejected.length,
    });
  } catch (error) {
    next(error);
  }
});
// Route to get supplier applications for the logged-in user
router.get('/application/person', (req, res) => {
  const personId = req.query.personId;  // Get personId from query parameter

  if (!personId) {
    return res.status(400).json({ message: 'Person ID is required' });
  }

  getSupplierApplicationsById(personId)
    .then((applications) => {
      if (applications.length === 0) {
        return res.status(404).json({ message: 'No supplier applications found.' });
      }
      res.json(applications);  // Return the applications as a response
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

//get supplier by personId
router.get('/check/:personId', (req, res) => {
  const personId = req.params.personId;  // Get personId from query parameter

  if (!personId) {
    return res.status(400).json({ message: 'Person ID is required' });
  }

  getSupplierById(parseInt(personId))
    .then((supplier) => {
      if (supplier.length === 0) {
        return res.status(404).json({ message: 'No supplier found.' });
      }
      res.json(supplier);  // Return the applications as a response
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

module.exports = router;