const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prismaClient");

const router = express.Router();

// JWT Config
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secure-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Register Endpoint
router.post("/register", async (req, res) => {
  console.log("Request Body:", req.body); // Debug log for request payload

  const { username, email, password, role } = req.body;

  // Validate input
  if (!username || !email || !password) {
    console.log("Validation Failed: Missing fields");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("Validation Failed: Email already in use");
      return res.status(400).json({ message: "Email is already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || "user", // Default role to "user"
        isActive: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET_KEY,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "User registered successfully.",
      token,
      role: newUser.role,
      username: newUser.username,
    });
  } catch (error) {
    console.error("Error during registration:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    res.status(500).json({ message: "An error occurred during registration." });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // Include role in token
      JWT_SECRET_KEY, // Use a secure secret key
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Respond with token, role, username, and id
    return res.status(200).json({
      message: "Login successful.",
      token, 
      role: user.role, 
      username: user.username, 
      userId: user.id, 
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "An error occurred during login." });
  }
});

module.exports = router;