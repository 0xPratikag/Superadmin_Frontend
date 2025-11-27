import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";

const AdminPermission = () => {
  const [subRoles, setSubRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState({
    subRoleId: null,
    permIndex: null,
    value: "",
  });
  const [newPermissions, setNewPermissions] = useState({});
  const token = localStorage.getItem("token");

  // ✅ Fetch SubRoles
  const fetchSubRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/getSubRoles`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log();
      
      setSubRoles(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch subroles");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add Permission
  const handleAdd = async (subRoleId) => {
    const newPerm = newPermissions[subRoleId]?.trim();
    if (!newPerm) return alert("Permission is required");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/${subRoleId}/addpermission`,
        { permission: newPerm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPermissions((prev) => ({ ...prev, [subRoleId]: "" }));
      fetchSubRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding permission");
    }
  };

  // ✅ Update Permission
  const handleUpdate = async (subRoleId, oldPermission) => {
    if (!editState.value.trim()) return alert("New permission is required");

    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL}/admin/${subRoleId}/updatepermission/${oldPermission}`,
        { newPermission: editState.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditState({ subRoleId: null, permIndex: null, value: "" });
      fetchSubRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating permission");
    }
  };

  // ✅ Delete Permission
  const handleDelete = async (subRoleId, permission) => {
    if (!window.confirm(`Delete permission "${permission}"?`)) return;

    try {
      await axios.delete(
        `${
          import.meta.env.VITE_API_BASE_URL}/admin/${subRoleId}/deletepermission/${permission}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting permission");
    }
  };

  useEffect(() => {
    fetchSubRoles();
  }, []);

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        Admin SubRoles & Permissions
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading subroles...</p>
      ) : subRoles.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-indigo-100">
              <th className="border p-2">Admin Name</th>
              <th className="border p-2">Admin Email</th>
              <th className="border p-2">SubRole</th>
              <th className="border p-2">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {subRoles.map((sr) => (
              <tr key={sr._id} className="hover:bg-gray-50">
                <td className="border p-2">{sr.admin_id?.name || "N/A"}</td>
                <td className="border p-2">{sr.admin_id?.email || "N/A"}</td>
                <td className="border p-2 font-semibold">{sr.name}</td>
                <td className="border p-2">
                  <div className="space-y-2">
                    {sr.permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {editState.subRoleId === sr._id &&
                        editState.permIndex === idx ? (
                          <>
                            <input
                              type="text"
                              value={editState.value}
                              onChange={(e) =>
                                setEditState({
                                  ...editState,
                                  value: e.target.value,
                                })
                              }
                              className="border rounded px-2 py-1 flex-1"
                            />
                            <button
                              onClick={() => handleUpdate(sr._id, perm)}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() =>
                                setEditState({
                                  subRoleId: null,
                                  permIndex: null,
                                  value: "",
                                })
                              }
                              className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{perm}</span>
                            <button
                              onClick={() =>
                                setEditState({
                                  subRoleId: sr._id,
                                  permIndex: idx,
                                  value: perm,
                                })
                              }
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sr._id, perm)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add new permission input */}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="New permission"
                        value={newPermissions[sr._id] || ""}
                        onChange={(e) =>
                          setNewPermissions((prev) => ({
                            ...prev,
                            [sr._id]: e.target.value,
                          }))
                        }
                        className="border rounded px-2 py-1 flex-1"
                      />
                      <button
                        onClick={() => handleAdd(sr._id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded flex items-center gap-1"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No subroles found</p>
      )}
    </div>
  );
};

export default AdminPermission;
