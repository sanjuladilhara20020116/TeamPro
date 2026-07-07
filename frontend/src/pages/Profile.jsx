import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  KeyRound,
  Loader2,
  Mail,
  Save,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Basic profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    bio: "",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // Fill form using logged-in user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        jobTitle: user.jobTitle || "",
        department: user.department || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  // Update basic profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.put("/users/profile", profileForm);

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put("/users/change-password", passwordForm);

      if (response.data.success) {
        toast.success("Password changed successfully");

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Remove account using soft delete
  const handleRemoveAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove your account? You will not be able to login again with this account."
    );

    if (!confirmed) return;

    try {
      setRemoving(true);

      const response = await api.delete("/users/profile");

      if (response.data.success) {
        toast.success("Account removed successfully");
        logout();
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove account");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your basic details, email, password, and account."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Basic details */}
        <form
          onSubmit={handleUpdateProfile}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg">
              <User size={26} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Basic Profile Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Update your name, email, role information, and short bio.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileInput
              label="Full Name"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              icon={User}
            />

            <ProfileInput
              label="Email Address"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              icon={Mail}
            />

            <ProfileInput
              label="Job Title"
              name="jobTitle"
              value={profileForm.jobTitle}
              onChange={handleProfileChange}
              icon={Briefcase}
              placeholder="Software Engineer Intern"
            />

            <ProfileInput
              label="Department"
              name="department"
              value={profileForm.department}
              onChange={handleProfileChange}
              icon={Building2}
              placeholder="Engineering"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-slate-700">
              Bio
            </label>

            <textarea
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              rows={5}
              placeholder="Short introduction about yourself..."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
            />
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        {/* Right side */}
        <div className="space-y-6">
          {/* Profile summary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-2xl font-bold text-white shadow-lg">
                {user?.name?.charAt(0)}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {user?.name}
                </h3>
                <p className="text-sm text-slate-500">{user?.email}</p>

                <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Change password */}
          <form
            onSubmit={handleChangePassword}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <KeyRound size={22} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">Change Password</h3>
                <p className="text-sm text-slate-500">
                  Update your login password.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Current password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="New password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {changingPassword ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <KeyRound size={17} />
              )}
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>

          {/* Danger zone */}
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h3 className="font-bold text-red-900">Danger Zone</h3>
                <p className="text-sm text-red-700">
                  Remove your account from the system.
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveAccount}
              disabled={removing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {removing ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Trash2 size={17} />
              )}
              {removing ? "Removing..." : "Remove Account"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileInput({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  type = "text",
  placeholder = "",
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
        <Icon size={18} className="text-slate-400" />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}