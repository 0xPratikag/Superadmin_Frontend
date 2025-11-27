// src/Components/Admin/CreateAdmin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    Branch_name: '',
    branch_email: '',
    branch_password: '',
    branch_phone: '',
    role: '',
    superAdminId: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // ✅ add navigate
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/create-admins`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSuccess('✅ Admin created successfully!');
            // ✅ redirect after success
      navigate('/admin/list'); 
      setFormData({
        Branch_name: '',
        branch_email: '',
        branch_password: '',
        branch_phone: '',
        role: '',
        superAdminId: '',
      });
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-3xl mx-auto bg-white shadow-2xl rounded-2xl border border-indigo-100">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">🚀 Create New Admin</h2>
      {success && (
        <p className="text-green-600 bg-green-50 p-3 rounded mb-4 border border-green-300 text-center">
          {success}
        </p>
      )}
      <form onSubmit={handleCreateAdmin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Name</label>
          <input
            type="text"
            name="Branch_name"
            value={formData.Branch_name}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Branch Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="branch_email"
            value={formData.branch_email}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="branch_password"
            value={formData.branch_password}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="branch_phone"
            value={formData.branch_phone}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Phone Number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role ID</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Role ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Super Admin ID</label>
          <input
            type="text"
            name="superAdminId"
            value={formData.superAdminId}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Super Admin ID"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-6 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold transition duration-300 hover:opacity-90 ${
              loading ? 'cursor-not-allowed opacity-70' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdmin;
