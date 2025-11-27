import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye } from 'lucide-react'; // icons

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const [formData, setFormData] = useState({
    Branch_name: '',
    branch_email: '',
    branch_phone: '',
    role: '',
    isActive: true,
    branch_password: '',
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  const fetchRoles = async () => {
    try {
      const res = await axiosAuth.get('/getAllRoles');
      setRoles(res.data || []);
    } catch (err) {
      alert('Failed to fetch roles');
    }
  };

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get(`/admin/get-admin/${id}`);
      const admin = res.data;
      setFormData({
        Branch_name: admin.Branch_name || '',
        branch_email: admin.branch_email || '',
        branch_phone: admin.branch_phone || '',
        role: admin.role?._id || '',
        isActive: admin.isActive || false,
        branch_password: '', // leave empty
      });
    } catch (err) {
      alert('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchAdmin();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Only send password if it was entered
      const payload = { ...formData };
      if (!payload.branch_password) delete payload.branch_password;

      await axiosAuth.patch(`/admin/update-admin/${id}`, payload);
      alert('Admin updated successfully');
      navigate('/admin/list');
    } catch (err) {
      alert('Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Edit Admin</h2>
      </div>

      {loading && <div className="mb-4 text-gray-500">Loading...</div>}

      <div className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              name="Branch_name"
              value={formData.Branch_name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="branch_email"
              value={formData.branch_email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="branch_phone"
              value={formData.branch_phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">Active</label>
          </div>

          {/* Change Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            {showPasswordField ? (
              <input
                type="password"
                name="branch_password"
                value={formData.branch_password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowPasswordField(true)}
                className="flex items-center gap-2 px-3 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                <Lock size={16} /> Change Password
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Update Admin
          </button>
        </form>
      </div>
    </div>
  );
}
