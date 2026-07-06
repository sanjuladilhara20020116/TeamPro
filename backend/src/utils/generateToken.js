const jwt = require("jsonwebtoken");

// Generate a secure JWT token for logged-in users
const generateToken = (user) => {
  return jwt.sign(
    {
      // Store only required user data inside token
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      // Token expires after 7 days for session security
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;