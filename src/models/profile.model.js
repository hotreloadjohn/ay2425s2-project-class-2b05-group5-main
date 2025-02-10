const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');

module.exports.getProfileData = async function getProfileData(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
    });
};

module.exports.verifyPassword = async function verifyPassword(userId, password) {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect password");

    return { success: true };
};


module.exports.updatePassword = async function updatePassword(id, newPassword) {

    const user = await prisma.user.findUnique({
      where: { id },
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    console.log("Retrieved user password hash: ", user.password);
  
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); 
  
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword, 
      },
    });
  
    return updatedUser;
  };
  
  

module.exports.updateUsername = async function updateUsername(id, newUsername) {

    const existingUserWithUsername = await prisma.user.findFirst({
      where: { username: newUsername }, 
    });

    if (existingUserWithUsername) {
      throw new Error("Username already exists.");
    }

    const user = await prisma.user.findUnique({
      where: { id }, 
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const updatedUser = await prisma.user.update({
      where: { id }, 
      data: { username: newUsername },
    });

    return updatedUser;
};


module.exports.updateEmail = async function updateEmail(userId, newEmail) {
    const existingEmail = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existingEmail) throw new Error("Email already exists");

    await prisma.user.update({ where: { id: userId }, data: { email: newEmail } });
    return { success: true };
};
