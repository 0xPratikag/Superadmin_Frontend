import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Key, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/admins-list");
      console.log(res);

      setAdmins(res.data || []);
    } catch (err) {
      alert("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openPermissionsModal = (permissions) => {
    setCurrentPermissions(permissions);
    setPermModalOpen(true);
  };

  const closePermissionsModal = () => setPermModalOpen(false);

  const handleEdit = (adminId) => {
    navigate(`/admin/edit/${adminId}`);
  };

  return (
    <div className="p-8 w-full mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Admin List</h2>
      </div>

      {loading && <div className="mb-4 text-gray-500">Loading admins...</div>}

      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="w-full text-left text-gray-700">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3">Branch Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Permissions</th>
              <th className="px-6 py-3">Created By</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr
                key={admin._id}
                className="border-b hover:bg-indigo-50 transition"
              >
                <td className="px-6 py-3 font-medium">{admin.Branch_name}</td>
                <td className="px-6 py-3">{admin.branch_email}</td>
                <td className="px-6 py-3">{admin.branch_phone}</td>
                <td className="px-6 py-3 text-indigo-600 font-medium">
                  {admin.role?.name || "N/A"}
                </td>
                <td className="px-6 py-3">
                  {admin.role?.permissions?.length > 0 ? (
                    <button
                      onClick={() =>
                        openPermissionsModal(admin.role.permissions)
                      }
                      className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                      title="View Permissions"
                    >
                      <Key size={16} />
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-6 py-3">
                  {admin.superAdminId?.name || "N/A"}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      admin.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-3 flex gap-3 text-sm text-gray-600">
                  <button
                    onClick={() => navigate(`/admin/details/${admin._id}`)}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    title="View Admin Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(admin._id)}
                    className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white"
                    title="Edit Admin"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No admins found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
