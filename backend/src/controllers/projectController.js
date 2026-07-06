const { validationResult } = require("express-validator");
const Project = require("../models/Project");
const User = require("../models/User");

// Create a new project or category
const createProject = async (req, res) => {
  try {
    // Read validation result from route validators
    const errors = validationResult(req);

    // Stop request if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, description, color, members } = req.body;

    // Check whether project name already exists
    const existingProject = await Project.findOne({ name });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "Project name already exists",
      });
    }

    // Create project with optional assigned members
    const project = await Project.create({
      name,
      description,
      color,
      members: members || [],
    });

    // Add this project to selected users' assignedProjects array
    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members } },
        { $addToSet: { assignedProjects: project._id } }
      );
    }

    // Return created project with member details
    const populatedProject = await Project.findById(project._id).populate(
      "members",
      "name email role"
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Get all active projects
const getProjects = async (req, res) => {
  try {
    // Find only active projects
    const projects = await Project.find({ isActive: true })
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get single project by id
const getProjectById = async (req, res) => {
  try {
    // Find selected project and include assigned members
    const project = await Project.findById(req.params.id).populate(
      "members",
      "name email role"
    );

    if (!project || project.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// Update project details
const updateProject = async (req, res) => {
  try {
    // Read validation result from route validators
    const errors = validationResult(req);

    // Stop request if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, description, color } = req.body;

    // Find project before updating
    const project = await Project.findById(req.params.id);

    if (!project || project.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check duplicate project name if name is changed
    if (name && name !== project.name) {
      const nameExists = await Project.findOne({ name });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: "Project name already exists",
        });
      }
    }

    // Update only provided fields
    project.name = name || project.name;
    project.description =
      description !== undefined ? description : project.description;
    project.color = color || project.color;

    await project.save();

    const updatedProject = await Project.findById(project._id).populate(
      "members",
      "name email role"
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Soft delete project
const deleteProject = async (req, res) => {
  try {
    // Find project before deleting
    const project = await Project.findById(req.params.id);

    if (!project || project.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Soft delete keeps old reports safe
    project.isActive = false;
    await project.save();

    // Remove deleted project from all users
    await User.updateMany(
      { assignedProjects: project._id },
      { $pull: { assignedProjects: project._id } }
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// Assign team members to a project
const assignMembersToProject = async (req, res) => {
  try {
    const { members } = req.body;

    // Validate members array
    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: "Members must be an array of user IDs",
      });
    }

    // Find selected project
    const project = await Project.findById(req.params.id);

    if (!project || project.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Keep old members before replacing
    const oldMembers = project.members.map((memberId) => memberId.toString());

    // Replace project members with new selected members
    project.members = members;
    await project.save();

    // Remove project from users who are no longer assigned
    const removedMembers = oldMembers.filter(
      (oldMemberId) => !members.includes(oldMemberId)
    );

    if (removedMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: removedMembers } },
        { $pull: { assignedProjects: project._id } }
      );
    }

    // Add project to newly selected users
    if (members.length > 0) {
      await User.updateMany(
        { _id: { $in: members } },
        { $addToSet: { assignedProjects: project._id } }
      );
    }

    const updatedProject = await Project.findById(project._id).populate(
      "members",
      "name email role"
    );

    return res.status(200).json({
      success: true,
      message: "Project members updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign members",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignMembersToProject,
};