import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit3,
  Filter,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const prettyLabel = (str = "") =>
  str
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function RoleManager() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedDesignationId, setSelectedDesignationId] = useState("");
  const [permissionIds, setPermissionIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [filterText, setFilterText] = useState("");

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  /* ======================= FETCHERS ======================= */

  // Permissions (active only)
  const fetchPermissions = async () => {
    setLoadingPerms(true);
    try {
      const res = await axiosAuth.get("/permissions", {
        params: { activeOnly: true },
      });
      setPermissions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to fetch permissions"
      );
    } finally {
      setLoadingPerms(false);
    }
  };

  // Designations (active only)
  const fetchDesignations = async () => {
    setLoadingDesignations(true);
    try {
      const res = await axiosAuth.get("/designations", {
        params: { activeOnly: true },
      });
      setDesignations(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to fetch designations"
      );
    } finally {
      setLoadingDesignations(false);
    }
  };

  // Roles
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await axiosAuth.get("/get-roles");
      setRoles(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchDesignations();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ======================= HELPERS ======================= */

  const resetForm = () => {
    setEditingId(null);
    setSelectedDesignationId("");
    setPermissionIds([]);
  };

  const togglePermission = (id) => {
    setPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Group permissions by module for nice UI
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach((p) => {
      const key = p.module || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [permissions]);

  // Nicely sorted designations
  const sortedDesignations = useMemo(() => {
    return [...designations].sort((a, b) => {
      // If order field
      if (typeof a.order === "number" && typeof b.order === "number") {
        if (a.order !== b.order) return a.order - b.order;
      }
      const labelA = (a.label || a.name || a.key || "").toLowerCase();
      const labelB = (b.label || b.name || b.key || "").toLowerCase();
      return labelA.localeCompare(labelB);
    });
  }, [designations]);

  const getDesignationLabel = (d) => {
    if (!d) return "—";
    return d.label || prettyLabel(d.name || d.key || "");
  };

  /* ======================= SUBMIT / CRUD ======================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDesignationId) {
      return toast.error("Please select a designation");
    }
    if (permissionIds.length === 0) {
      return toast.error("Please select at least one permission");
    }

    const payload = {
      designationId: selectedDesignationId,
      permissions: permissionIds,
    };

    setSaving(true);
    try {
      if (editingId) {
        await axiosAuth.put(`/upsert-roles/${editingId}`, payload);
        toast.success("Role updated successfully");
      } else {
        await axiosAuth.post("/roles", payload);
        toast.success("Role created successfully");
      }
      resetForm();
      fetchRoles();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (role) => {
    setEditingId(role._id);

    // role.designation should be populated from backend
    if (role.designation?._id) {
      setSelectedDesignationId(role.designation._id);
    } else {
      // fallback: try to match by name/key
      const guess = designations.find(
        (d) =>
          d._id === role.designation ||
          d.key === role.name ||
          d.name === role.name
      );
      setSelectedDesignationId(guess?._id || "");
    }

    setPermissionIds((role.permissions || []).map((p) => p._id?.toString()));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }
    try {
      await axiosAuth.delete(`/delete-roles/${id}`);
      toast.success("Role deleted");
      if (editingId === id) resetForm();
      fetchRoles();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete role");
    }
  };

  const filteredRoles = useMemo(() => {
    if (!filterText.trim()) return roles;
    const t = filterText.toLowerCase();
    return roles.filter((r) => {
      const nameMatch = r.name?.toLowerCase().includes(t);
      const designationMatch = getDesignationLabel(r.designation)
        .toLowerCase()
        .includes(t);
      const permMatch = (r.permissions || []).some(
        (p) =>
          p.name?.toLowerCase().includes(t) ||
          p.code?.toLowerCase().includes(t)
      );
      return nameMatch || designationMatch || permMatch;
    });
  }, [roles, filterText]);

  /* ======================= UI ======================= */

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Roles & Permissions
            </h1>
            <p className="text-sm text-slate-500">
              Map designations to permission sets to control access across the
              system.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow border border-indigo-100">
            <Users className="h-3 w-3 text-indigo-600" />
            <span className="font-medium text-slate-700">Total Roles:</span>
            <span className="font-semibold text-indigo-600">
              {roles.length}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow border border-emerald-100">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span className="font-medium text-slate-700">
              Permissions Loaded:
            </span>
            <span className="font-semibold text-emerald-600">
              {permissions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: Role Form */}
        <div className="rounded-2xl border border-indigo-100 bg-white/90 shadow-sm shadow-indigo-100/60">
          <div className="border-b border-indigo-50 px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Role" : "Create New Role"}
              </h2>
              <p className="text-xs text-slate-500">
                Choose a designation and assign permissions.
              </p>
            </div>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50"
              >
                Clear Editing
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-5 pb-5 pt-4 space-y-5 text-sm"
          >
            {/* Designation */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Designation
              </label>
              <select
                value={selectedDesignationId}
                onChange={(e) => setSelectedDesignationId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  {loadingDesignations
                    ? "Loading designations..."
                    : "Select a designation…"}
                </option>
                {sortedDesignations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {getDesignationLabel(d)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Each designation can have one role mapping.
              </p>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Permissions
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Grouped by module. Click to toggle.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPermissionIds(
                        (permissions || []).map((p) => p._id.toString())
                      )
                    }
                    className="text-[11px] rounded-full border border-indigo-200 px-3 py-1 text-indigo-600 hover:bg-indigo-50"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissionIds([])}
                    className="text-[11px] rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {loadingPerms && (
                <div className="text-xs text-slate-500">
                  Loading permissions…
                </div>
              )}

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {Object.entries(groupedPermissions).map(
                  ([moduleName, perms]) => {
                    const allSelected = perms.every((p) =>
                      permissionIds.includes(p._id)
                    );
                    const someSelected =
                      !allSelected &&
                      perms.some((p) => permissionIds.includes(p._id));

                    const toggleGroup = () => {
                      if (allSelected) {
                        setPermissionIds((prev) =>
                          prev.filter(
                            (id) => !perms.some((p) => p._id === id)
                          )
                        );
                      } else {
                        setPermissionIds((prev) => {
                          const set = new Set(prev);
                          perms.forEach((p) => set.add(p._id));
                          return Array.from(set);
                        });
                      }
                    };

                    return (
                      <div
                        key={moduleName}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={toggleGroup}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-800"
                          >
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                                allSelected
                                  ? "border-indigo-500 bg-indigo-500 text-white"
                                  : someSelected
                                  ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                                  : "border-slate-300 bg-white text-slate-400"
                              }`}
                            >
                              {allSelected ? "✓" : someSelected ? "−" : ""}
                            </div>
                            {moduleName}
                          </button>
                          <span className="text-[11px] text-slate-400">
                            {perms.length} items
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {perms.map((perm) => {
                            const isChecked = permissionIds.includes(perm._id);
                            return (
                              <button
                                type="button"
                                key={perm._id}
                                onClick={() => togglePermission(perm._id)}
                                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] text-left transition
                                  ${
                                    isChecked
                                      ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                                  }
                                `}
                              >
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                                    isChecked
                                      ? "border-indigo-500 bg-indigo-500 text-white"
                                      : "border-slate-300 bg-slate-50 text-slate-400"
                                  }`}
                                >
                                  {isChecked && "✓"}
                                </span>
                                <span className="truncate">{perm.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Role"
                  : "Create Role"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Roles Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Existing Roles
                </h2>
                <p className="text-[11px] text-slate-500">
                  Manage and audit current role definitions.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by designation or permission…"
              className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="max-h-[540px] overflow-y-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Designation / Role</th>
                  <th className="px-5 py-3">Permissions</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingRoles && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-4 text-center text-slate-500 text-sm"
                    >
                      Loading roles…
                    </td>
                  </tr>
                )}

                {!loadingRoles && filteredRoles.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-5 text-center text-slate-400 text-sm"
                    >
                      No roles found. Create one from the left panel.
                    </td>
                  </tr>
                )}

                {!loadingRoles &&
                  filteredRoles.map((role) => (
                    <tr
                      key={role._id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="px-5 py-3 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            {getDesignationLabel(role.designation)}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5">
                            Internal key: {role.name}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {(role.permissions || []).length} permissions
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {(role.permissions || []).slice(0, 6).map((p) => (
                            <span
                              key={p._id}
                              className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700"
                            >
                              {p.name}
                            </span>
                          ))}
                          {role.permissions &&
                            role.permissions.length > 6 && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                                +{role.permissions.length - 6} more
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200"
                            title="Edit role"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(role._id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
                            title="Delete role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
