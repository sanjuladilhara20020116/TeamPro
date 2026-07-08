import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Camera,
  ImagePlus,
  KeyRound,
  Loader2,
  Mail,
  Save,
  Trash2,
  User,
  XCircle,
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

  // Controls profile edit mode
  const [editMode, setEditMode] = useState(false);

  // Basic profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    bio: "",
    profilePhoto: "",
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
        profilePhoto: user.profilePhoto || "",
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

  // Cancel edit and reset values
  const handleCancelEdit = () => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        jobTitle: user.jobTitle || "",
        department: user.department || "",
        bio: user.bio || "",
        profilePhoto: user.profilePhoto || "",
      });
    }

    setEditMode(false);
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
        setEditMode(false);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("Image must be less than 1MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileForm((prev) => ({
        ...prev,
        profilePhoto: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileForm((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
  };

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your basic details, email, password, and account."
    >
      <div className="relative">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-20 left-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"></div>

        <div className="relative grid gap-6 xl:grid-cols-[1fr_420px]">
          {/* Center profile details */}
          <form
            onSubmit={handleUpdateProfile}
            className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-2xl shadow-slate-200/80 backdrop-blur-2xl"
          >
            {/* Stylish profile header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-900 to-rose-500 px-6 py-12 text-white lg:px-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-300/35 blur-3xl"></div>
              <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-3xl"></div>
              <div className="absolute left-1/2 top-12 h-44 w-44 rounded-full bg-white/10 blur-3xl"></div>

              {/* Center profile image and main details */}
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-[2.8rem] bg-gradient-to-br from-amber-300/30 via-rose-300/30 to-white/20 blur-2xl"></div>

                  <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-[2.6rem] bg-gradient-to-br from-rose-500 to-amber-400 text-6xl font-bold text-white shadow-2xl ring-4 ring-white/30">
                    {profileForm.profilePhoto ? (
                      <img
                        src={profileForm.profilePhoto}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profileForm.name?.charAt(0) || <User size={54} />
                    )}
                  </div>

                  {/* Small camera icon is edit button */}
                  {!editMode && (
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-xl ring-1 ring-white/50 transition hover:-translate-y-0.5 hover:scale-105"
                      title="Edit profile"
                    >
                      <Camera size={17} />
                    </button>
                  )}

                  {editMode && (
                    <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-xl ring-1 ring-white/50">
                      <Camera size={17} />
                    </div>
                  )}
                </div>

                <h3 className="mt-6 text-4xl font-bold tracking-tight">
                  {profileForm.name || "Your Name"}
                </h3>

                <p className="mt-2 text-sm text-rose-50">
                  {profileForm.email || "your@email.com"}
                </p>

                {/* Only job title soft label */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/15 px-5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-xl">
                    {profileForm.jobTitle || "Job title not added"}
                  </span>
                </div>

                {editMode && (
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-rose-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                      <ImagePlus size={18} />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>

                    {profileForm.profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/25"
                      >
                        <XCircle size={18} />
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="mb-8 text-center">
                <div
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ring-1 ${
                    editMode
                      ? "bg-amber-50 text-amber-700 ring-amber-100"
                      : "bg-rose-50 text-rose-700 ring-rose-100"
                  }`}
                >
                  {editMode ? "Edit Mode Enabled" : "Profile View Mode"}
                </div>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  {editMode
                    ? "You can now update your profile details and save changes."
                    : "Your profile details are displayed below. Click the camera icon to update your information."}
                </p>
              </div>

              {/* Display / edit fields */}
              <div className="grid gap-5 md:grid-cols-2">
                <ProfileInput
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  icon={User}
                  disabled={!editMode}
                />

                <ProfileInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  icon={Mail}
                  disabled={!editMode}
                />

                <ProfileInput
                  label="Job Title"
                  name="jobTitle"
                  value={profileForm.jobTitle}
                  onChange={handleProfileChange}
                  icon={Briefcase}
                  placeholder="Software Engineer Intern"
                  disabled={!editMode}
                />

                <ProfileInput
                  label="Department"
                  name="department"
                  value={profileForm.department}
                  onChange={handleProfileChange}
                  icon={Building2}
                  placeholder="Engineering"
                  disabled={!editMode}
                />
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-slate-700">
                  Bio
                </label>

                <div
                  className={`mt-2 rounded-3xl border p-1 transition ${
                    editMode
                      ? "border-slate-200 bg-slate-50 focus-within:border-rose-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-100"
                      : "border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-inner"
                  }`}
                >
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows={5}
                    disabled={!editMode}
                    placeholder="Short introduction about yourself..."
                    className={`w-full resize-none rounded-[1.3rem] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-400 ${
                      editMode
                        ? "text-slate-700"
                        : "cursor-not-allowed text-slate-700"
                    }`}
                  />
                </div>
              </div>

              {editMode && (
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-amber-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Right side - password and danger zone only */}
          <div className="space-y-6">
            {/* Change password */}
            <form
              onSubmit={handleChangePassword}
              className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-2xl"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-sm">
                  <KeyRound size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Change Password</h3>
                  <p className="text-sm text-slate-500">
                    Update your login password.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <PasswordInput
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current password"
                />

                <PasswordInput
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New password"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="overflow-hidden rounded-[2rem] border border-red-200 bg-white shadow-xl shadow-red-100/60">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <AlertTriangle size={23} />
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
  disabled = false,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <div
        className={`mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-inner transition ${
          disabled
            ? "border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50"
            : "border-slate-200 bg-slate-50 focus-within:border-rose-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-100"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${
            disabled ? "text-rose-500" : "text-rose-600"
          }`}
        >
          <Icon size={18} />
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-400 ${
            disabled ? "cursor-not-allowed text-slate-700" : "text-slate-700"
          }`}
        />
      </div>
    </div>
  );
}

function PasswordInput({ name, value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-100">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
        <KeyRound size={17} />
      </div>

      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}