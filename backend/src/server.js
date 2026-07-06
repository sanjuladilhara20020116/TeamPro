//create express server-server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Create Express application
const app = express();

// Allow frontend to communicate with backend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Allow backend to read JSON data from request body
app.use(express.json());

// Test route to check backend is working
app.get("/", (req, res) => {
  res.send("TeamPro API is running...");
});




// Authentication API routes
app.use("/api/auth", authRoutes);

// Project/category API routes
app.use("/api/projects", projectRoutes);

// Weekly report API routes
app.use("/api/reports", reportRoutes);






// Handle wrong API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Get port number from .env file
const PORT = process.env.PORT || 5000;

// Start backend server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});