const prisma = require('./prismaClient');
// Check if the person exists
module.exports.checkPersonExist = function checkPersonExist(personId) {
  return prisma.user
    .findUnique({
      where: { id: parseInt(personId) },
    })
    .then((person) => {
      if (!person) {
        throw new Error(`Person with ID ${personId} does not exist.`);
      }
      console.log(`Person with ID ${personId} exists.`);
      return person.id;
    });
};

// Check if the supplyadmin exists
module.exports.checkSuppAdminExist = function checkSuppAdminExist(suAdminId) {
  return prisma.supplierAdmin
    .findUnique({
      where: { id: parseInt(suAdminId) },
    })
    .then((suAdmin) => {
      if (!suAdmin) {
        throw new Error(`SupplierAdmin with ID ${suAdminId} does not exist.`);
      }
      console.log(`SupplierAdmin with ID ${suAdminId} exists.`);
      return suAdmin.id;
    });
};

// Check for supplier apply conflicts
module.exports.checkConflictSuApply = function checkConflictSuApply(personId) {
  return prisma.supplierApply
    .findMany({
      where: {
        personId:parseInt(personId),
        status: { in: ['approve', 'pending'] },
      },
    })
    .then((applications) => {
      if (applications.length > 0) {
        throw new Error(`User already has a conflicting application.`);
      }
      console.log(`No conflicting application for person ID ${personId}.`);
      return personId;
    });
};
//check conflict supplier 
module.exports.checkConflictSupplier = function checkConflictSupplier(personId) {
  return prisma.supplier
    .findMany({
      where: {
        personId:parseInt(personId)
      },
    })
    .then((supplier) => {
      if (supplier.length > 0) {
        throw new Error(`User already has a conflicting supplier.`);
      }
      console.log(`No conflicting supplier for person ID ${personId}.`);
      return personId;
    });
};
// Create a new supplier application
module.exports.addNewSuApply = function addNewSuApply(personId, companyName, productType, Reason) {
  return module.exports.checkPersonExist(personId)
    .then(() => module.exports.checkConflictSuApply(personId))
    .then(() =>
      prisma.supplierApply.create({
        data: { personId: parseInt(personId),         // Use the correct variable here
          companyName: companyName,   // Use the correct variable here
          productType: productType,   // Use the correct variable here
          Reason: Reason         },
      })
    )
    .then((supplierApply) => {
      console.log('Supplier apply created:', supplierApply);
      return supplierApply;
    })
    .catch((error) => {
      throw error;
    });
};

// Get pending supplier applications
module.exports.getSupplierApplications = function getSupplierApplications(status, search) {
  return prisma.supplierApply.findMany({
    where: {
      AND: [
        status ? { status: status } : {}, // Filter by status if provided
        search ? { companyName: { contains: search, mode: 'insensitive' } } : {} // Search by company name if provided
      ],
    },
    include: { user: true },
  })
  .then((applications) => {
    console.log('Filtered supplier applications:', applications);
    return applications;
  });
};


//get supplier apply by id
module.exports.getPendSuApplyListByid = function getPendSuApplyListByid(suApplyId) {
  return prisma.supplierApply
    .findUnique({
      where: { id: parseInt(suApplyId) },
    })
    .then((suApplyId) => {
      console.log('supplier applications:', suApplyId);
      return suApplyId;
    });
};

// Edit supplier application
module.exports.editSuApply = function editSuApply(suapplyId, companyName, productType, Reasonforapply) {
  return prisma.supplierApply
    .updateMany({
      where: { id: parseInt(suapplyId) },
      data: { companyName, productType, Reasonforapply },
    })
    .then((result) => {
      if (result.count === 0) {
        throw new Error('Application not found or unauthorized action.');
      }
      console.log('Supplier application updated successfully.');
      return { message: 'Application updated successfully.' };
    })
    .catch((error) => {
      console.error('Error updating supplier application:', error.message);
      throw error;
    });
};
// Delete supplier application
module.exports.deleteSupplierApply = function deleteSupplierApply(suApplyId, personId) {
  return prisma.supplierApply
    .delete({
      where: { id: suApplyId, personId : parseInt(personId) },
    })
    .then((application) => {
      console.log('Supplier application deleted:', application);
      return application;
    });
};

// Approve or reject supplier application
module.exports.updateSuApplyStatus = function updateSuApplyStatus(suapplyId,status,adminreason) {
  return prisma.supplierApply
    .update({
      where:{ id: parseInt(suapplyId)},
      data: { status: status, AdminReason:adminreason },
    })
    .then((application) => {
      console.log('Application status updated:', application);
      return application;
    });
};

// Add a new supplier
module.exports.addNewSupplier = function addNewSupplier(personId, companyName, productType, supplierAdminId) {
  return module.exports.checkPersonExist(personId)
    .then(() => module.exports.checkConflictSupplier(personId))
    .then(() =>
      prisma.supplier.create({
        data: { personId:parseInt(personId),
           companyName,
            productType, 
            supplierAdminId:parseInt(supplierAdminId) },
      })
    )
    .then((supplier) => {
      console.log('New supplier added:', supplier);
      return prisma.user.update({
        where: { id: parseInt(personId) },
        data: { role: 'supplier' }, // Update user role to supplier
      })
      .then(() => supplier);
    })
    .catch((error) => {
      throw error;
    });
};

// Add to supplier.model.js

module.exports.getSupplierCountByCompany = function getSupplierCountByCompany() {
  return prisma.supplier
    .groupBy({
      by: ['companyName'],  // Group by company name
      _count: {
        companyName: true,  // Count suppliers by company
      },
    })
    .then((result) => {
      // Check if there are multiple results, not just one
      if (result.length === 0) {
        throw new Error('No suppliers found.');
      }
      
      // Return the mapped data for each company
      return result.map(company => ({
        companyName: company.companyName,  // Company name
        supplierCount: company._count.companyName,  // Supplier count for each company
      }));
    })
    .catch((error) => {
      console.error("Error fetching supplier count by company:", error);
      throw error;  // Re-throw the error to be handled by the caller
    });
};
// Get supplier applications for the logged-in user
module.exports.getSupplierApplicationsById = function getSupplierApplicationsById(personId) {
  return prisma.supplierApply
    .findMany({
      where: {
        personId: parseInt(personId),  // Filter by personId
      },
      include: {
        user: true,  // Optionally include person details if needed
      },
    })
    .then((applications) => {
      console.log('Supplier applications for user:', applications);
      return applications;
    })
    .catch((error) => {
      console.error('Error fetching supplier applications:', error);
      throw error;
    });
};

//get supplier by personId 
module.exports.getSupplierById = function getSupplierById(personId) {
  return prisma.supplier
    .findMany({
      where: {
        personId: parseInt(personId),  // Filter by personId
      },
      include: {
        user: true,  // Optionally include person details if needed
      },
    })
    .then((supplier) => {
      console.log('Supplier for user:', supplier);
      return supplier;
    })
    .catch((error) => {
      console.error('Error fetching supplier:', error);
      throw error;
    });
};