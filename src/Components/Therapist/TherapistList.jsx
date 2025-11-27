import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TherapistList = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSpecializations, setCurrentSpecializations] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch all therapists
  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/therapists");
      setTherapists(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch therapists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  // Delete therapist
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this therapist?")) return;
    setDeletingId(id);
    try {
      await axiosAuth.delete(`/delete-therapist/${id}`);
      setTherapists(therapists.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete therapist");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/therapist/edit/${id}`);
  };

  // Open specialization modal
  const openSpecializationModal = (specializations) => {
    setCurrentSpecializations(specializations);
    setModalOpen(true);
  };

  const closeSpecializationModal = () => {
    setModalOpen(false);
    setCurrentSpecializations([]);
  };

  return (
    <div className="p-8 w-full mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Therapists List</h2>
      </div>

      {loading && <div className="mb-4 text-gray-500">Loading therapists...</div>}

      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="w-full text-left text-gray-700">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Specialization</th>
              <th className="px-6 py-3">Branch</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {therapists.map((t) => (
              <tr key={t._id} className="border-b hover:bg-indigo-50 transition">
                <td className="px-6 py-3 font-medium">{t.name}</td>
                <td className="px-6 py-3">{t.email}</td>
                <td className="px-6 py-3">{t.phone}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => openSpecializationModal(t.specialization)}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                  >
                    <Info size={16} /> View
                  </button>
                </td>
                <td className="px-6 py-3">{t.branchName || t.branch}</td>
                <td className="px-6 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(t._id)}
                    className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    disabled={deletingId === t._id}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {therapists.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No therapists found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Specialization Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={closeSpecializationModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Specializations</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentSpecializations.map((spec) => (
                <li
                  key={spec}
                  className="border rounded px-3 py-1 bg-indigo-50 text-indigo-700 font-medium"
                >
                  {spec}
                </li>
              ))}
              {currentSpecializations.length === 0 && (
                <li className="text-gray-500 col-span-2 text-center">
                  No specializations
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistList;
