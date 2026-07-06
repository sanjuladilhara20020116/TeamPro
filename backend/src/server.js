//create express server-server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

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

// Get port number from .env file
const PORT = process.env.PORT || 5000;

// Start backend server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});