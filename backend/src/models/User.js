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


    // User job title or position
jobTitle: {
  type: String,
  default: "",
  trim: true,
},

// User department or team name
department: {
  type: String,
  default: "",
  trim: true,
},

// Short user bio
bio: {
  type: String,
  default: "",
  trim: true,
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