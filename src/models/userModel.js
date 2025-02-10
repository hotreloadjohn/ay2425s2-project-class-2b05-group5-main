const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Check if a user exists by email
module.exports.findUserByEmail = function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
};

// Create a new user
module.exports.createUser = function createUser(data) {
  return prisma.user.create({ data });
};

// Verify user credentials (email and password)
module.exports.verifyUserCredentials = async function verifyUserCredentials(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid email or password.");
  return user;
};

