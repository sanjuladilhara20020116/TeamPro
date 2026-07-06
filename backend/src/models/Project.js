const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
      trim: true,
    },

    
    description: {
      type: String,
      default: "",
    },

    // Color UI /badges and charts
    color: {
      type: String,
      default: "#6366f1",
    },

    // Project members, optional assignment feature
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Soft delete support
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);