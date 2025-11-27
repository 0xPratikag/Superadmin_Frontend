import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, PlusCircle, Shield, Key } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function SubRoleManager() {
  const [subRoles, setSubRoles] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [formData, setFormData] = useState({
    admin_id: "",
    name: "",
    permissions: [],
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  // 🔑 All available subroles
  const rolesList = [
    { key: "clinicalDirector", label: "Clinical Director" },
    // { key: "admin", label: "Admin" },
    { key: "therapist", label: "Therapist" },
    { key: "specialist", label: "Specialist" },
    { key: "teamLead", label: "Team Lead" },
    { key: "frontDesk", label: "Front Desk" },
  ];

  // 🔐 All available permissions
  const permissionsList = [
    "dashboard",
    "cases",
    "create_case",
    "view_case",
    "generate_bill",
    "billing",
    "view_bill",
    "payment",
    "online_payment",
    "offline_payment",
    "transactions",
    "members",
    "invite_member",
    "schedule_meeting",
    "all_scheduled",
    "updateAppointmentStatus",
    "viewPatientHistory",
    "cancelAppointment",
    "giveFeedback",
  ];

  useEffect(() => {
    fetchSubRoles();
    fetchBranchList();
  }, []);

  const fetchSubRoles = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get(`/admin/getSubRoles`);
      setSubRoles(res.data);
    } catch (err) {
      alert(
        `Failed to fetch subroles: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchList = async () => {
    try {
      const res = await axiosAuth.get(`/admins-list`);
      setBranchList(res.data);
    } catch (err) {
      alert(
        `Failed to fetch branch list: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const openModal = (subRole = null) => {
    if (subRole) {
      setEditId(subRole._id);
      setFormData({
        admin_id: subRole.admin_id._id,
        name: subRole.name,
        permissions: subRole.permissions,
      });
    } else {
      setEditId(null);
      setFormData({ admin_id: "", name: "", permissions: [] });
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
        await axiosAuth.put(`/admin/updateSubRoles/${editId}`, formData);
        alert("SubRole updated successfully");
      } else {
        await axiosAuth.post(`/admin/create-subRoles`, formData);
        alert("SubRole created successfully");
      }
      fetchSubRoles();
      closeModal();
    } catch (err) {
      alert(
        `Error saving subrole: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subrole?"))
      return;
    try {
      setLoading(true);
      await axiosAuth.delete(`/admin/deleteSubRoles/${id}`);
      fetchSubRoles();
    } catch (err) {
      alert(
        `Error deleting subrole: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subRole) => openModal(subRole);

  return (
    <div className="p-8 w-full mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-indigo-600" /> SubRole Manager
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <PlusCircle size={20} /> Add SubRole
        </button>
      </div>

      {loading && <div className="mb-4 text-gray-500">Loading...</div>}

      {/* SubRoles Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="w-full text-left text-gray-700">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3">Admin (Branch)</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Permissions</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subRoles.map((sub) => (
              <tr key={sub._id} className="border-b hover:bg-indigo-50 transition">
                <td className="px-6 py-3">{sub?.admin_id?.Branch_name}</td>
                <td className="px-6 py-3 font-medium">{sub?.name}</td>
                <td className="px-6 py-3">{sub?.admin_id?.branch_email}</td>
                <td className="px-6 py-3">{sub?.admin_id?.branch_phone}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => openPermissionsModal(sub.permissions)}
                    className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    title="View Permissions"
                  >
                    <Key size={16} />
                  </button>
                </td>
                <td className="px-6 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(sub)}
                    className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {subRoles.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No SubRoles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
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
              {editId ? "Edit SubRole" : "Add SubRole"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Branch Dropdown */}
              <select
                name="admin_id"
                value={formData.admin_id}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select Admin (Branch)</option>
                {branchList.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.Branch_name}
                  </option>
                ))}
              </select>

              {/* Role Dropdown */}
              <select
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select SubRole</option>
                {rolesList.map((role) => (
                  <option key={role.key} value={role.key}>
                    {role.label}
                  </option>
                ))}
              </select>

              {/* Permissions Multi Select */}
              <select
                multiple
                value={formData.permissions}
                onChange={handlePermissionsChange}
                className="w-full border rounded px-3 py-2 h-48 focus:ring-2 focus:ring-indigo-400"
              >
                {permissionsList.map((perm) => (
                  <option key={perm} value={perm}>
                    {perm}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                {editId ? "Update SubRole" : "Create SubRole"}
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
