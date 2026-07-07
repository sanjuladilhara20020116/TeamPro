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
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 p-4 sm:p-6">
        {/* Background glass decorations */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-36 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative z-10">
          {/* Top action section */}
          <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700 shadow-sm backdrop-blur-xl">
                  <FolderKanban size={15} />
                  Project Workspace
                </div>

                <h3 className="mt-4 bg-gradient-to-r from-slate-950 via-indigo-800 to-cyan-700 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  Projects / Categories
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Manage work categories used in weekly reports with a cleaner,
                  modern and organized project view.
                </p>
              </div>

              <button
                onClick={openCreateModal}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(79,70,229,0.45)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 transition group-hover:bg-white/30">
                  <Plus size={18} />
                </span>
                Add Project
              </button>
            </div>

            {/* Small overview cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Total Projects
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {projects.length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Team Members
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {members.length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Status
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-600">
                  Active
                </p>
              </div>
            </div>
          </div>

          {/* Project cards */}
          {loading ? (
            <div className="flex min-h-[330px] items-center justify-center rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg">
                  <Loader2 className="animate-spin text-white" size={34} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Loading projects...
                </p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-[2rem] border border-white/70 bg-white/60 p-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-indigo-100 to-cyan-100 shadow-inner">
                <FolderKanban className="text-indigo-500" size={54} />
              </div>

              <h3 className="mt-6 text-2xl font-black text-slate-900">
                No projects created yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first project/category for weekly report tagging and
                team member assignment.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus size={18} />
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:bg-white/75 hover:shadow-[0_30px_75px_rgba(15,23,42,0.14)]"
                >
                  <div
                    className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-20 blur-2xl transition group-hover:opacity-30"
                    style={{ backgroundColor: project.color }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] text-white shadow-[0_16px_35px_rgba(15,23,42,0.20)] ring-4 ring-white/50"
                          style={{ backgroundColor: project.color }}
                        >
                          <FolderKanban size={27} />
                        </div>

                        <div>
                          <h3 className="line-clamp-1 text-lg font-black text-slate-950">
                            {project.name}
                          </h3>

                          <p className="mt-1 inline-flex rounded-full bg-slate-900/5 px-3 py-1 text-xs font-bold text-slate-500">
                            {project.members?.length || 0} assigned members
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-100 transition md:opacity-80 md:group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(project)}
                          className="rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-2.5 text-indigo-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md"
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="rounded-2xl border border-red-200/70 bg-red-50/80 p-2.5 text-red-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-6 min-h-[56px] text-sm leading-6 text-slate-600">
                      {project.description || "No description added."}
                    </p>

                    <div className="mt-6 rounded-3xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <Users size={16} />
                        </span>
                        Assigned Members
                      </div>

                      {project.members?.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.members.map((member) => (
                            <span
                              key={member._id}
                              className="rounded-full border border-white/80 bg-gradient-to-r from-slate-50 to-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
                            >
                              {member.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 rounded-2xl bg-slate-100/70 px-4 py-3 text-sm font-medium text-slate-400">
                          No members assigned.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">
          <div className="pointer-events-none absolute left-10 top-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/20 bg-white/80 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/60 bg-white/70 px-6 py-5 backdrop-blur-2xl">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
                  <FolderKanban size={14} />
                  Project Setup
                </div>

                <h3 className="mt-2 bg-gradient-to-r from-slate-950 to-indigo-700 bg-clip-text text-2xl font-black text-transparent">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create project categories and assign team members.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-2.5 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Project name */}
              <div>
                <label className="text-sm font-black text-slate-700">
                  Project / Category Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Internal Tooling"
                  className="mt-2 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Project description */}
              <div>
                <label className="text-sm font-black text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Short description about this project/category."
                  className="mt-2 w-full resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="text-sm font-black text-slate-700">
                  Project Color
                </label>

                <div className="mt-3 rounded-3xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex flex-wrap gap-3">
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
                        className={`h-11 w-11 rounded-2xl border-4 shadow-md transition duration-300 hover:scale-110 ${
                          formData.color === color
                            ? "scale-110 border-slate-950 ring-4 ring-slate-200"
                            : "border-white"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Member assignment */}
              <div>
                <label className="text-sm font-black text-slate-700">
                  Assign Team Members
                </label>

                {members.length === 0 ? (
                  <div className="mt-3 rounded-3xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm font-semibold text-amber-700 shadow-sm backdrop-blur-xl">
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
                          className={`flex items-center justify-between rounded-3xl border px-4 py-3 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                            selected
                              ? "border-indigo-300/80 bg-indigo-50/90 ring-4 ring-indigo-100/70"
                              : "border-white/80 bg-white/65 hover:bg-white"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {member.name}
                            </p>
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {member.email}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black shadow-sm ${
                              selected
                                ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
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
              <div className="flex justify-end gap-3 border-t border-white/70 pt-5">
                <button
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-3 text-sm font-black text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveProject}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(79,70,229,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
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