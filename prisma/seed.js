const prisma = require("../src/models/prismaClient");
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const { password } = require("pg/lib/defaults");
const { v4: uuidv4 } = require('uuid');

const statuses = [
  { text: "Pending" },
  { text: "In Progress" },
  { text: "Completed" },
  { text: "On Hold" },
];

const persons = [
  { email: "alice@example.com", name: "Alice" },
  { email: "bob@example.com", name: "Bob" },
  { email: "carol@example.com", name: "Carol" },
  { email: "dave@example.com", name: "Dave" },
  { email: "eve@example.com", name: "Eve" },
];

const users = [
  {
    username: "yisang",
    email: "yisang@gmail.com",
    password: "123",
  },
  {
    username: "faust",
    email: "faust@gmail.com",
    password: "123",
  },
  {
    username: "quixote",
    email: "qx@gmail.com",
    password: "123",
  },
  {
    username: "ryoshu",
    email: "ryoshu@gmail.com",
    password: "123",
  },
  {
    username: "meursault",
    email: "meursault@gmail.com",
    password: "123",
    role: "supplier",
  },
  {
    username: "honglu",
    email: "honglu@gmail.com",
    password: "123",
    role: "supplier",
  },
  {
    username: "heathcliff",
    email: "heathcliff@gmail.com",
    password: "123",
    role: "supplier"
  },
  {
    username: "ishmael",
    email: "ishmael@gmail.com",
    password: "123",
  },
  {
    username: "rodion",
    email: "rodion@gmail.com",
    password: "123",
  },
  {
    username: "sinclair",
    email: "sinclair@gmail.com",
    password: "123",
  },
  {
    username: "outis",
    email: "outis@gmail.com",
    password: "123",
  },
  {
    username: "gregor",
    email: "gregor@gmail.com",
    password: "123",
  },
  {
    username: "dante",
    email: "dante@gmail.com",
    password: "123",
    role: "admin",
  },
  {
    username: "vergilius",
    email: "vergilius@gmail.com",
    password: "123",
    role: "admin",
  },
  {
    username: "delivery",
    email: "delivery@gmail.com",
    password: "delivery",
    role: "delivery",
  },
  {
    username :"bloodWolf",
    email: "bloodwolf@gmail.com",
    password:"dpslove",
  },
  {
    username:"vgg",
    email:"lgg@gmail.com",
    password:"rglove",
  },
];

const supplierApply = [
  {
    personId: 1,
    companyName: "Limbus",
    productType: "Electronics",
    Reason: "Expanding business to new regions.",
  },
  {
    personId: 2,
    companyName: "Limbus",
    productType: "Furniture",
    Reason: "Looking for reliable suppliers.",
  },
  {
    personId: 3,
    companyName: "Gamma Ltd",
    productType: "Textiles",
    Reason: "Diversifying product offerings.",
  },
  {
    personId: 4,
    companyName: "Delta Corp",
    productType: "Food and Beverages",
    Reason: "Exploring international markets.",
  },
  {
    personId: 5,
    status: "approved",
    companyName: "CompanyA",
    productType: "Furniture",
    Reason: "Supplying innovative designs.",
    AdminReason: "approve",
  },
  {
    personId: 6,
    status: "approved",
    companyName: "TechNova",
    productType: "Software Solutions",
    Reason: "Providing advanced tech solutions for businesses.",
    AdminReason: "approve",
  },
  {
    personId: 7,
    status: "approved",
    companyName: "Green Earth",
    productType: "Eco-friendly Products",
    Reason: "Sustainability in manufacturing and packaging.",
    AdminReason: "approve",
  },
  {
    personId: 8,
    status: "rejected",
    companyName: "Speed Logistics",
    productType: "Transport Services",
    Reason: "Improving supply chain efficiency.",
    AdminReason: "reject",
  },
  {
    personId: 9,
    companyName: "Fashion Hub",
    productType: "Clothing",
    Reason: "Expanding market reach globally.",
  },
  {
    personId: 10,
    companyName: "Medicare Supplies",
    productType: "Medical Equipment",
    Reason: "Meeting growing demand in healthcare.",
  },
];

const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    description: "A high-precision wireless mouse",
    unitPrice: 25.99,
    stockQuantity: 100,
    country: "USA",
    productType: "Electronics",
    manufacturedOn: new Date("2023-01-16"),
    imageUrl: ("../images/wireless_mouse.png"),
    lastKnownPrice: 40.00,

  },
  {
    id: 2,
    name: "Office Chair",
    description: "Ergonomic office chair with lumbar support",
    unitPrice: 199.99,
    stockQuantity: 50,
    country: "Canada",
    productType: "Furniture",
    manufacturedOn: new Date("2022-11-20"),
    imageUrl: ("../images/office_chair.png"),
    lastKnownPrice: 210.00,

  },
  {
    id: 3,
    name: "Bluetooth Headphones",
    description: "Noise-cancelling over-ear headphones",
    unitPrice: 129.99,
    stockQuantity: 200,
    country: "Germany",
    productType: "Electronics",
    manufacturedOn: new Date("2023-03-10"),
    imageUrl: ("../images/bluetooth_headphones.png"),
    lastKnownPrice: 129.99,


  },
  {
    id: 4,
    name: "Notebook",
    description: "100-page spiral notebook",
    unitPrice: 2.49,
    stockQuantity: 1000,
    country: "India",
    productType: "Stationery",
    manufacturedOn: new Date("2023-07-25"),
    imageUrl: ("../images/notebook.png"),
    lastKnownPrice: 2.49,

  },
  {
    id: 5,
    name: "Portable Mini Fan",
    description: "USB rechargeable mini fan with 3-speed settings",
    unitPrice: 19.99,
    stockQuantity: 300,
    country: "Thailand",
    productType: "Accessories",
    manufacturedOn: new Date("2023-06-30"),
    imageUrl: "../images/portable_mini_fan.jpg",
    lastKnownPrice: 29.99,

  },
  {
    id: 6,
    name: "Air Fryer",
    description: "4L digital air fryer with multiple cooking modes",
    unitPrice: 129.99,
    stockQuantity: 80,
    country: "USA",
    productType: "Home Appliances",
    manufacturedOn: new Date("2023-02-18"),
    imageUrl: "../images/air_fryer.jpg",
    lastKnownPrice: 129.99,

  },
  {
    id: 7,
    name: "Organic Green Tea",
    description: "Premium organic green tea leaves, 100g pack",
    unitPrice: 15.99,
    stockQuantity: 500,
    country: "Japan",
    productType: "Groceries",
    manufacturedOn: new Date("2023-07-05"),
    imageUrl: "../images/organic_green_tea.png",
    lastKnownPrice: 19.99,

  },
  {
    id: 8,
    name: "Running Shoes",
    description: "Lightweight breathable running shoes for men and women",
    unitPrice: 59.99,
    stockQuantity: 200,
    country: "Vietnam",
    productType: "Fashion",
    manufacturedOn: new Date("2023-08-10"),
    imageUrl: "../images/running_shoes.png",
    lastKnownPrice: 70.00,

  },
  {
    id: 9,
    name: "Wireless Charger",
    description: "Fast-charging wireless pad for smartphones",
    unitPrice: 39.99,
    stockQuantity: 300,
    country: "China",
    productType: "Accessories",
    manufacturedOn: new Date("2023-06-20"),
    imageUrl: "../images/wireless_charger.png",
    lastKnownPrice: 45.99,

  }
];

const locations = [
  { name: "Hello Mini Mart", location: "Blk 364 Clementi Ave 2 #01-210", postalCode: 120364 },
  { name: "Residential Place", location: "Blk 331 Clementi Ave 2, #04-288", postalCode: 120331 },
  { name: "Tampines Mart", location: "Tampines Central 1 #01-21", postalCode: 529543 },
  { name: "Happiness Printing Store", location: "304 Orchard Road, #04-20", postalCode: 238863 },
  { name: "Residential Place", location: "Blk 369 Woodlands Ave 1 #06-288", postalCode: 730369 },
  { name: "Shop N Fun", location: "Blk 202 Jurong East Street 21, #01-404B", postalCode: 600202 },
  { name: "Stationery Store", location: "Blk 123 Bukit Merah Lane 1, #01-388", postalCode: 150123 }
]

const supplierAdmins = [{ personId: 13 }, { personId: 14 }];

const suppliers = [
  {
    personId: 5,
    companyName: "CompanyA",
    productType: "Furniture",
    supplierAdminId: 1,
  },
  {
    personId: 6,
    companyName: "TechNova",
    productType: "Software Solutions",
    supplierAdminId: 1,
  },
  {
    personId: 7,
    companyName: "Green Earth",
    productType: "Eco-friendly Products",
    supplierAdminId: 1,
  },
];

// Reviews for user
const reviews = [
  { productId: 1, username: "alex", rating: 5, text: "good" },
  { productId: 2, username: "ash", rating: 4, text: "good" },
  { productId: 3, username: "johndoe", rating: 4, text: "good" },
  { productId: 4, username: "wong", rating: 4, text: "good" },
  { productId: 5, username: "shiu", rating: 5, text: "good" },
  { productId: 6, username: "user", rating: 4, text: "good" },
  { productId: 7, username: "user 1", rating: 4, text: "good" },
  { productId: 8, username: "user", rating: 4, text: "good" },
  { productId: 9, username: "mu", rating: 5, text: "good" },
];

//Order Items
const orders = [
  {}
]
// Coupon Data
const coupons = [{
  stripeId: 'SUMMER20',  
  name:null,
  duration: 'once',
  durationMonths:null,
  percentOff: 20, 
  amountOff:null, 
  currency:"sgd",
  redeemBy:null,
  timesRedeemed: 0, 
  valid:true
},{
  stripeId: 'DrPq8GuO',  
  name:'CNY',
  duration: 'once',  
  durationMonths:null,
  percentOff: null, 
  amountOff: 5, 
  currency:"sgd",
  redeemBy:null,
  timesRedeemed: 0, 
  valid:true
}];

// Function to hash passwords
async function hashPasswords(users) {
  const saltRounds = 10; // Recommended salt rounds for bcrypt
  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, saltRounds),
    }))
  );
  return hashedUsers;
}

async function main() {
  // Hash the passwords in the users array
  const hashedUsers = await hashPasswords(users);

  // Seed Statuses
  await prisma.status.createMany({
    data: statuses,
    skipDuplicates: true,
  });

  const insertedStatuses = await prisma.status.findMany(); // Fetch inserted statuses

  // Seed Persons
  await prisma.person.createMany({
    data: persons,
    skipDuplicates: true,
  });

  const insertedPersons = await prisma.person.findMany(); // Fetch inserted persons

  // Seed Tasks
  await prisma.task.createMany({
    data: [
      { name: "Seed 1", statusId: insertedStatuses[0].id },
      { name: "Seed 2", statusId: insertedStatuses[1].id },
    ],
    skipDuplicates: true,
  });

  const tasks = await prisma.task.findMany(); // Fetch inserted tasks

  // Seed Task Assignments
  await prisma.taskAssignment.createMany({
    data: [
      { personId: insertedPersons[0].id, taskId: tasks[0].id },
      { personId: insertedPersons[1].id, taskId: tasks[0].id },
      { personId: insertedPersons[2].id, taskId: tasks[1].id },
      { personId: insertedPersons[3].id, taskId: tasks[1].id },
    ],
    skipDuplicates: true,
  });

  // Seed Reviews
  for (const review of reviews) {
    try {
      // Check if productId exists
      const productExists = await prisma.product.findUnique({
        where: { id: review.productId },
      });

      if (!productExists) {
        console.warn(`Product ID ${review.productId} does not exist. Skipping this review.`);
        continue;
      }

      // Create the review
      await prisma.review.create({
        data: {
          productId: review.productId,
          username: review.username,
          rating: review.rating,
          text: review.text,
        },
      });

      console.log(`Added review for product ID ${review.productId}`);
    } catch (error) {
      console.error(`Error adding review for product ID ${review.productId}:`, error);
    }

  console.log("Finished seeding reviews.");
}

  // Seed Users with hashed passwords
  await prisma.user.createMany({
    data: hashedUsers,
    skipDuplicates: true,
  });

  const insertedUsers = await prisma.user.findMany(); // Fetch inserted users
  console.log(insertedUsers)

  // Map supplierApply with valid personId
  const supplierApplications = supplierApply.map((apply, index) => ({
    ...apply,
    personId: insertedUsers[index]?.id || 0, // Map to corresponding user ID
  }));

  // Seed Supplier Applications
  await prisma.supplierApply.createMany({
    data: supplierApplications,
    skipDuplicates: true,
  });

  // Seed Products
  await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  // Seed Collection Points
  await prisma.collectionPointLocations.createMany({
    data: locations,
  });

  const insertedProducts = await prisma.product.findMany(); // Fetch inserted products
  console.log(insertedProducts);

  const insertedLocations = await prisma.collectionPointLocations.findMany(); // Fetch inserted products
  console.log(insertedLocations);

  await prisma.supplierAdmin.createMany({
    data: supplierAdmins,
    skipDuplicates: true,
  });

  // Seed Supplier 
  await prisma.supplier.createMany({
    data: suppliers,
    skipDuplicates: true,
  });

  // Create order
  const user = insertedUsers.find(u => u.id === 1);
  const product1 = insertedProducts.find(p => p.id === 1);
  const product2 = insertedProducts.find(p => p.id === 2);
  const order = await prisma.order.create({
    data: {
      sessionId: uuidv4(), // Generate a unique session ID
      personId: user.id, // Assign to user ID 1
      orderItems: {
        create: [
          {
            productId: product1.id,
            quantity: 2,
          },
          {
            productId: product2.id,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log("Order seeded:", order);
  
  //Coupons
  await prisma.coupon.createMany({
    data: coupons,
    skipDuplicates: true,
  });

   console.log('Coupon created and stored successfully!');
   
  console.log("Seed data inserted successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
