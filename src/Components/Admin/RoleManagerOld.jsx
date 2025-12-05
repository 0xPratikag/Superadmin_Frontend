import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, PlusCircle, Key } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function RoleManagerOld() {
  const [roles, setRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [currentPermissions, setCurrentPermissions] = useState([]);

  const [loading, setLoading] = useState(false);

  const ALL_PERMISSIONS = [
    "Admin",
    "createTherapist",
    "createSuperAdmin",
    "viewAllUsers",
    "viewAllAppointments",
    "manageSystemSettings",
    "createUser",
    "bookAppointment",
    "viewAppointments",
    "assignTherapist",
    "viewTherapistSchedule",
    "viewOwnAppointments",
    "addTreatmentNotes",
    "updateAppointmentStatus",
    "viewPatientHistory",
    "cancelAppointment",
    "giveFeedback",
  ];

  const ROLE_OPTIONS = ["superadmin", "admin", "therapist", "user"];
  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const getErrorMessage = (err) => {
    if (err.response)
      return (
        err.response.data?.message || err.response.data?.error || "Server Error"
      );
    if (err.request) return "Network error. Please check your connection.";
    return err.message || "Unknown error occurred.";
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/getAllRoles");
      setRoles(res.data);
    } catch (err) {
      alert(`Failed to fetch roles: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (role = null) => {
    if (role) {
      setEditId(role._id);
      setFormData({ name: role.name, permissions: role.permissions });
    } else {
      setEditId(null);
      setFormData({ name: "", permissions: [] });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const openPermissionsModal = (permissions) => {
    setCurrentPermissions(permissions);
    setPermModalOpen(true);
  };

  const closePermissionsModal = () => setPermModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionsChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, permissions: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editId) {
        await axiosAuth.patch(`/update-role/${editId}`, formData);
        alert("Role updated successfully");
      } else {
        await axiosAuth.post("/create-role", formData);
        alert("Role created successfully");
      }
      fetchRoles();
      closeModal();
    } catch (err) {
      alert(`Error saving role: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      setLoading(true);
      await axiosAuth.delete(`/delete-role/${id}`);
      fetchRoles();
    } catch (err) {
      alert(`Error deleting role: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Roles Manager</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <PlusCircle size={20} /> Add Role
        </button>
      </div>

      {loading && <div className="mb-4 text-gray-500">Loading...</div>}

      {/* Roles Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="w-full text-left text-gray-700">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Permissions</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role._id}
                className="border-b hover:bg-indigo-50 transition"
              >
                <td className="px-6 py-3 font-medium">{role.name}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => openPermissionsModal(role.permissions)}
                    className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    title="View Permissions"
                  >
                    <Key size={16} />
                  </button>
                </td>
                <td className="px-6 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => openModal(role)}
                    className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(role._id)}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Role" : "Add Role"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select Role</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                multiple
                value={formData.permissions}
                onChange={handlePermissionsChange}
                className="w-full border rounded px-3 py-2 h-48 focus:ring-2 focus:ring-indigo-400"
              >
                {ALL_PERMISSIONS.map((perm) => (
                  <option key={perm} value={perm}>
                    {perm}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                {editId ? "Update Role" : "Create Role"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={closePermissionsModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Permissions</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPermissions.map((perm) => (
                <li
                  key={perm}
                  className="border rounded px-3 py-1 bg-indigo-50 text-indigo-700 font-medium"
                >
                  {perm}
                </li>
              ))}
              {currentPermissions.length === 0 && (
                <li className="text-gray-500 col-span-2 text-center">
                  No permissions
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
