const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/recent', async (req, res) => {
  try {
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: {
        id: true,
        customer: { select: { name: true } },
        status: { select: { id: true, text: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(recentOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

module.exports = router;
