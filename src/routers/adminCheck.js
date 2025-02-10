const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/adminCheck", async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "user" } });
    const activeUsers = await prisma.user.count({ where: { role: "user", isActive: true } });
    const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
    const activeAdmins = await prisma.user.count({ where: { role: "admin", isActive: true } });
    const totalSuppliers = await prisma.user.count({ where: { role: "supplier" } });
    const activeSuppliers = await prisma.user.count({ where: { role: "supplier", isActive: true } });

    res.status(200).json({
      success: true,
      
      data: { totalUsers, activeUsers, totalAdmins, activeAdmins,totalSuppliers, activeSuppliers},

    });
  } catch (error) {
    console.error("Error fetching admin statistics:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch admin statistics." });
  }
});

module.exports = router;
