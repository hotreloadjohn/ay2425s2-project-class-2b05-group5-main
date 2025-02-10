const prisma = require('./prismaClient');

// Check if the person exists
module.exports.checkPersonExist = function checkPersonExist(personId) {
  return prisma.user.findUnique({
      where: { id: personId },
    })
    .then((person) => {
      if (!person) {
        throw new Error(`Person with ID ${personId} does not exist.`);
      }
      console.log(`Person with ID ${personId} exists.`);
      return person.id;
    });
};

// Check for supplier admin conflicts
module.exports.checkConflictSuAdmin = function checkConflictSuAdmin(personId) {
  return prisma.supplierAdmin
    .findMany({
      where: { personId: personId },
    })
    .then((supplierAdmins) => {
      if (supplierAdmins.length > 0) {
        throw new Error(`Supplier admin with person ID ${personId} already exists.`);
      }
      console.log(`No conflict for person ID ${personId}.`);
      return personId;
    });
};

// Create a new supplier admin
module.exports.createSupplierAdmin = function createSupplierAdmin(personId) {
  return prisma.supplierAdmin
    .create({
      data: {
        personId: personId,
      },
    })
    .then((supplierAdmin) => {
      console.log('Supplier admin created:', supplierAdmin);
      return supplierAdmin;
    });
};

// Delete a supplier admin by ID
module.exports.deleteSupplierAdmin = function deleteSupplierAdmin(suAdminId) {
  return prisma.supplierAdmin
    .delete({
      where: { id: suAdminId },
    })
    .then((supplierAdmin) => {
      console.log('Supplier admin deleted:', supplierAdmin);
      return supplierAdmin;
    });
};

// Add a new supplier admin
module.exports.addNewSuAdmin = function addNewSuAdmin(personId) {
  // Use module.exports to lazily reference the functions
  return module.exports.checkPersonExist(personId)
    .then(() => module.exports.checkConflictSuAdmin(personId))
    .then(() => module.exports.createSupplierAdmin(personId))
    .then((supplierAdmin) => {
      console.log('New supplier admin added:', supplierAdmin);
      return supplierAdmin;
    })
    .catch((error) => {
      throw error;
    });
};

// Delete supplier admin by ID
module.exports.deleteSuAdminById = function deleteSuAdminById(suAdminId) {
  // Use module.exports to lazily reference the function
  return module.exports.deleteSupplierAdmin(suAdminId)
    .then((supplierAdmin) => {
      console.log('Supplier admin deleted by ID:', supplierAdmin);
      return supplierAdmin;
    })
    .catch((error) => {
      if (error instanceof prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error(`The supplier admin with ID ${suAdminId} was not found!`);
        }
      }
      throw error;
    });
};

//get supplier admin by personId
module.exports.FindSupplierAdminByPersonId = function FindSupplierAdminByPersonId(personId) {
  return prisma.supplierAdmin
    .findMany({
      where: { personId: personId },
    })
    .then((supplierAdmins) => {
      console.log('supplier admin:', supplierAdmins);
      return supplierAdmins;
    })
    .catch((error) => {
      if (error instanceof prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error(`The supplier admin with ID ${personId} was not found!`);
        }
      }
      throw error;
    });
};