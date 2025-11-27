import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Key, Save } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function SettingPage() {
  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    adminLogo: "",
    therapistLogo: "",
    siteTitle: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [adminLogoPreview, setAdminLogoPreview] = useState(null);
  const [therapistLogoPreview, setTherapistLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const getErrorMessage = (err) => {
    if (err.response)
      return (
        err.response.data?.message || err.response.data?.error || "Server Error"
      );
    if (err.request) return "Network error. Please check your connection.";
    return err.message || "Unknown error occurred.";
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/settings");
      setProfile(res.data);
      setAdminLogoPreview(res.data.adminLogo);
      setTherapistLogoPreview(res.data.therapistLogo);
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setProfile((prev) => ({ ...prev, [name]: files[0] }));
      if (name === "adminLogo") setAdminLogoPreview(URL.createObjectURL(files[0]));
      if (name === "therapistLogo") setTherapistLogoPreview(URL.createObjectURL(files[0]));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("siteTitle", profile.siteTitle);
      if (profile.adminLogo instanceof File)
        formData.append("adminLogo", profile.adminLogo);
      if (profile.therapistLogo instanceof File)
        formData.append("therapistLogo", profile.therapistLogo);

      await axiosAuth.post("/update-settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ type: "success", text: "Settings updated successfully." });
      fetchSettings();
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New password and confirm password do not match.",
      });
      return;
    }
    try {
      setLoading(true);
      await axiosAuth.post("/change-password", passwordData);
      setMessage({ type: "success", text: "Password updated successfully." });
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 mx-auto min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">SuperAdmin Settings</h2>

      {message.text && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading && <div className="mb-4 text-gray-500">Loading...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Logos Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-4">Profile & Logos</h3>
          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={profile.name}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={profile.email}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
              required
            />
            <input
              type="text"
              name="siteTitle"
              placeholder="Site Title"
              value={profile.siteTitle}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex flex-col items-center gap-2">
                {adminLogoPreview && (
                  <img
                    src={adminLogoPreview}
                    alt="Admin Logo"
                    className="w-24 h-24 object-contain rounded border"
                  />
                )}
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100">
                  <Upload size={18} /> Admin Logo
                  <input type="file" name="adminLogo" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="flex flex-col items-center gap-2">
                {therapistLogoPreview && (
                  <img
                    src={therapistLogoPreview}
                    alt="Therapist Logo"
                    className="w-24 h-24 object-contain rounded border"
                  />
                )}
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100">
                  <Upload size={18} /> Therapist Logo
                  <input type="file" name="therapistLogo" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
            >
              <Save size={18} /> Save Settings
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <input
              type="password"
              name="oldPassword"
              placeholder="Current Password"
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, oldPassword: e.target.value })
              }
              className="border px-3 py-2 rounded w-full"
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              className="border px-3 py-2 rounded w-full"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="border px-3 py-2 rounded w-full"
              required
            />
            <button
              type="submit"
              className="mt-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
            >
              <Key size={18} /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
