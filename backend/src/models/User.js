const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
      trim: true,
    },

    
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    
    password: {
      type: String,
      required: true,
    },

    // Role controls 
    role: {
      type: String,
      enum: ["member", "manager", "admin"],
      default: "member",
    },

    // Projects assigned to this user
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);