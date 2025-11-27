import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const TherapistCreate = () => {
  const [formData, setFormData] = useState({
    branch_password: "",
    name: "",
    email: "",
    phone: "",
    specialization: [],
    branch: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [branches, setBranches] = useState([]);
  const token = localStorage.getItem("token");

  const { id } = useParams(); // get therapist id from URL
  const navigate = useNavigate();

  const specializationOptions = [
    "Physiotherapy",
    "Psychology",
    "Occupational Therapy",
    "Speech Therapy",
    "Counseling",
  ];

  // Fetch branches for dropdown
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admins-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches(res.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, [token]);

  // Fetch therapist data if in edit mode
  useEffect(() => {
    if (id) {
      const fetchTherapist = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/therapist/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { name, email, phone, specialization, branch } = res.data;
          setFormData({ ...formData, name, email, phone, specialization, branch });
        } catch (err) {
          console.error("Failed to fetch therapist data", err);
        }
      };
      fetchTherapist();
    }
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      if (id) {
        // UPDATE
        const res = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/update-therapist/${id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess("✅ Therapist updated successfully!");
      } else {
        // CREATE
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/create-therapist`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess("✅ Therapist created successfully!");
        setFormData({
          branch_password: "",
          name: "",
          email: "",
          phone: "",
          specialization: [],
          branch: "",
        });
      }

      // Redirect to therapist list after 1-2s
      setTimeout(() => navigate("/therapist/list"), 1500);
    } catch (err) {
      alert(err?.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 w-11/12 mx-auto bg-white shadow-2xl rounded-2xl border border-indigo-100">
      <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
        {id ? "✏️ Update Therapist" : "👩‍⚕️ Create New Therapist"}
      </h2>

      {success && (
        <p className="text-green-600 bg-green-50 p-3 rounded mb-6 border border-green-300 text-center">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password {id && "(leave blank to keep existing)"}
          </label>
          <input
            type="password"
            name="branch_password"
            value={formData.branch_password}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Password"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Email"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Phone Number"
            required
          />
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Specialization</label>
          <select
            multiple
            name="specialization"
            value={formData.specialization}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              setFormData({ ...formData, specialization: selected });
            }}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-400"
            required
          >
            {specializationOptions.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold <kbd>Ctrl</kbd> (Windows) or <kbd>Cmd</kbd> (Mac) to select multiple
          </p>
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch</label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value="">-- Select Branch --</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.Branch_name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="col-span-full text-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold transition duration-300 hover:opacity-90 ${
              loading ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {loading ? (id ? "Updating..." : "Creating...") : id ? "Update Therapist" : "Create Therapist"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TherapistCreate;
