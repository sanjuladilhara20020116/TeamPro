const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect private routes using JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Read token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Stop request if token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token using JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find logged-in user without password
    const user = await User.findById(decoded.id).select("-password");

    // Stop request if user no longer exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Stop request if user account is disabled
    // Only block user if account is manually disabled
// If isActive is missing in old documents, user can still continue
    if (!user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    // Attach user data to request object
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Allow only selected roles to access a route
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check whether logged-in user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};