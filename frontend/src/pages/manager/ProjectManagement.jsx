import { useEffect, useState } from "react";
import {
  Edit3,
  FolderKanban,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function ProjectManagement() {
  // Store project/category list
  const [projects, setProjects] = useState([]);

  // Store team members for assignment
  const [members, setMembers] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form state for add/edit project
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#4f46e5",
    members: [],
  });

  // Predefined color options for attractive badges
  const colorOptions = [
    "#4f46e5",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  // Fetch all active projects
  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects");

      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Fetch members using manager dashboard filter API
  const fetchMembers = async () => {
    try {
      const response = await api.get("/dashboard/filters");

      if (response.data.success) {
        setMembers(response.data.members);
      }
    } catch (error) {
      toast.error("Failed to load team members");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  // Open add project modal
  const openCreateModal = () => {
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
      color: "#4f46e5",
      members: [],
    });

    setShowModal(true);
  };

  // Open edit project modal
  const openEditModal = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name || "",
      description: project.description || "",
      color: project.color || "#4f46e5",

      // Convert populated members into id array
      members: project.members?.map((member) => member._id) || [],
    });

    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  // Update form input values
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Select or unselect member from project
  const toggleMember = (memberId) => {
    const alreadySelected = formData.members.includes(memberId);

    if (alreadySelected) {
      setFormData({
        ...formData,
        members: formData.members.filter((id) => id !== memberId),
      });
    } else {
      setFormData({
        ...formData,
        members: [...formData.members, memberId],
      });
    }
  };

  // Validate project form before sending to backend
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Project name must be at least 2 characters");
      return false;
    }

    return true;
  };

  // Create or update project
  const handleSaveProject = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const projectPayload = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
      };

      let projectId;

      if (editingProject) {
        // Update existing project details
        const updateResponse = await api.put(
          `/projects/${editingProject._id}`,
          projectPayload
        );

        projectId = updateResponse.data.project._id;
      } else {
        // Create new project with selected members
        const createResponse = await api.post("/projects", {
          ...projectPayload,
          members: formData.members,
        });

        projectId = createResponse.data.project._id;
      }

      // Assign selected members to project
      await api.patch(`/projects/${projectId}/assign`, {
        members: formData.members,
      });

      toast.success(
        editingProject
          ? "Project updated successfully"
          : "Project created successfully"
      );

      closeModal();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  // Soft delete project
  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? Old reports will remain safe."
    );

    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}`);

      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <DashboardLayout
      title="Project Management"
      subtitle="Add, edit, delete, and assign team members to projects."
    >
      {/* Top action section */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Projects / Categories
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Manage work categories used in weekly reports.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Project cards */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={34} />
            <p className="mt-3 text-sm text-slate-500">
              Loading projects...
            </p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <FolderKanban className="mx-auto text-slate-300" size={54} />

          <h3 className="mt-5 text-xl font-bold text-slate-900">
            No projects created yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Create your first project/category for weekly report tagging.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                    style={{ backgroundColor: project.color }}
                  >
                    <FolderKanban size={25} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {project.name}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {project.members?.length || 0} assigned members
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600 transition hover:bg-indigo-100"
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <p className="mt-5 min-h-[48px] text-sm leading-6 text-slate-500">
                {project.description || "No description added."}
              </p>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users size={17} />
                  Assigned Members
                </div>

                {project.members?.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <span
                        key={member._id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    No members assigned.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create project categories and assign team members.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Project name */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Project / Category Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Internal Tooling"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Project description */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Short description about this project/category."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Project Color
                </label>

                <div className="mt-3 flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          color,
                        })
                      }
                      className={`h-10 w-10 rounded-2xl border-4 transition ${
                        formData.color === color
                          ? "border-slate-900 scale-110"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Member assignment */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Assign Team Members
                </label>

                {members.length === 0 ? (
                  <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                    No team members found. Register member accounts first.
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {members.map((member) => {
                      const selected = formData.members.includes(member._id);

                      return (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => toggleMember(member._id)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                            selected
                              ? "border-indigo-200 bg-indigo-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {member.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {member.email}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              selected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {selected ? "Selected" : "Add"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveProject}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}