const express = require("express");
const { body } = require("express-validator");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembersToProject,
} = require("../controllers/projectController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Project validation rules
const projectValidation = [
  body("name")
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 2 })
    .withMessage("Project name must be at least 2 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot be more than 500 characters"),

  body("color")
    .optional()
    .isString()
    .withMessage("Color must be a string"),

  body("members")
    .optional()
    .isArray()
    .withMessage("Members must be an array"),
];

// All logged-in users can view projects
router.get("/", protect, getProjects);

// All logged-in users can view one project
router.get("/:id", protect, getProjectById);

// Only manager and admin can create projects
router.post(
  "/",
  protect,
  authorizeRoles("manager", "admin"),
  projectValidation,
  createProject
);

// Only manager and admin can update projects
router.put(
  "/:id",
  protect,
  authorizeRoles("manager", "admin"),
  projectValidation,
  updateProject
);

// Only manager and admin can  delete projects
router.delete(
  "/:id",
  protect,
  authorizeRoles("manager", "admin"),
  deleteProject
);

// Only manager and admin can assign members
router.patch(
  "/:id/assign",
  protect,
  authorizeRoles("manager", "admin"),
  assignMembersToProject
);

module.exports = router;