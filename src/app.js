const express = require('express');
const createError = require('http-errors');
const bodyParser = require('body-parser'); 
const taskRouter = require('./routers/Task.router');
const statusRouter = require('./routers/Status.router');
const personRouter = require('./routers/Person.router');
const productRouter = require('./routers/Product.router');
const cartRouter = require('./routers/Cart.router');
const supplierRouter = require('./routers/supplier.router');
const suAdminRouter = require('./routers/supplierAdmin.router');
const crProductRouter = require('./routers/createProduct.router');
const ordersRoutes = require('./routers/finance.router');
const userController = require("./controller/userController");
const reviewRouter = require('./routers/reviewRoutes');
const orderHistoryRouter = require('./routers/orderHistory.router');
const profileRouter = require('./routers/profile.router');
const adminCheck = require ('./routers/adminCheck');
const wishlistRoutes = require('./routers/wishlistRoutes');
const couponsRoutes=require('./routers/Coupons.router')
const collectionPointRoutes=require('./routers/collectionPoint.router')
const deliveryRoutes = require('./routers/delivery.router')

const Stripe = require('stripe');
const prisma = require('./models/prismaClient')
const stripe = Stripe('sk_test_51QOcvUAuYNt6Tkf5Nyc6nGHeXFsZkgldoy1hwQkwrOXe48aATj3ObKX0t71pTZ9nLhHib7kDp9IlKV0xnpXobjxo00l6Cd3NWx');

const path = require('path');

const app = express();

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_aJdkEKCWNZDHIHZUHWHgoqwMjkuq7ucj';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      if (!session.metadata || !session.metadata.personId || !session.metadata.selectedItems) {
        console.warn('Missing session metadata.');
        return res.status(400).send('Invalid session metadata.');
      }

      const userId = parseInt(session.metadata.personId, 10);
      const selectedItems = session.metadata.selectedItems.split(',').map(Number);

      if (!userId || !selectedItems.length) {
        console.warn('Invalid session metadata.');
        return res.status(400).send('Invalid session metadata.');
      }

      try {
        const activeCart = await prisma.cart.findFirst({
          where: { personId: userId, isActive: true },
        });

        if (!activeCart) {
          console.warn('No active cart found for the user.');
          return res.status(400).send('No active cart found.');
        }

        const cartItems = await prisma.cartitem.findMany({
          where: { productId: { in: selectedItems }, cartId: activeCart.cartId },
        });

        const order = await prisma.order.create({
          data: {
            sessionId: session.id,
            personId: userId,  
            orderItems: { 
              create: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        });

        for (const item of cartItems) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stockQuantity < item.quantity) {
            console.warn(`Insufficient stock for product ID: ${item.productId}`);
            return res.status(400).send(`Insufficient stock for product ID: ${item.productId}`);
          }

          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });

          await prisma.cartitem.delete({ where: { id: item.id } });
        }
        console.log(`Order ${order.id} created successfully.`);
      } catch (error) {
        console.error('Error processing order:', error);
        return res.status(500).send('Internal server error.');
      }

      break;
    }
  }

  res.status(200).send('Webhook received');
});

app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

app.use('/products', productRouter);
app.use('/carts', cartRouter);
app.use('/tasks', taskRouter);
app.use('/statuses', statusRouter);
app.use('/persons', personRouter);

app.use('/supplier',supplierRouter)
app.use('/supplierAdmin',suAdminRouter)
app.use('/crProduct',crProductRouter)
app.use("/user", userController);
app.use('/reviews', reviewRouter);
app.use('/orders', ordersRoutes);
app.use('/orderHistory', orderHistoryRouter)
app.use('/profile', profileRouter)
app.use('/admin', adminCheck);
app.use('/wishlist', wishlistRoutes);
app.use('/coupons',couponsRoutes);
app.use('/delivery/collectionPoints', collectionPointRoutes)
app.use('/delivery', deliveryRoutes)

app.use((req, res, next) => {
  next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
});


app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Unknown Server Error!' });
});

module.exports = app;