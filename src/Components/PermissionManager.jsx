import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  KeyRound,
  ShieldCheck,
  PlusCircle,
  Edit3,
  Trash2,
  Filter,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const MODULE_OPTIONS = [
  "Admin",
  "Therapist",
  "Assistant",
  "Monitoring",
  "Billing",
  "Cases",
  "Schedule",
  "Assignments",
  "General",
];

export default function PermissionManager() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [module, setModule] = useState("General");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [activeOnly, setActiveOnly] = useState(false);

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setModule("General");
    setDescription("");
    setIsActive(true);
  };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeOnly) params.activeOnly = true;
      if (moduleFilter !== "all") params.module = moduleFilter;

      const res = await axiosAuth.get("/permissions", { params });
      setPermissions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to fetch permissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeOnly, moduleFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      return toast.error("Name and Code are required");
    }

    const payload = {
      name: name.trim(),
      code: code
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_"),
      module,
      description,
      isActive,
    };

    try {
      if (editingId) {
        await axiosAuth.put(`/permissions/${editingId}`, payload);
        toast.success("Permission updated successfully");
      } else {
        await axiosAuth.post("/permissions", payload);
        toast.success("Permission created successfully");
      }
      resetForm();
      fetchPermissions();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to save permission"
      );
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setName(p.name || "");
    setCode(p.code || "");
    setModule(p.module || "General");
    setDescription(p.description || "");
    setIsActive(p.isActive ?? true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) {
      return;
    }
    try {
      await axiosAuth.delete(`/permissions/${id}`);
      toast.success("Permission deleted");
      if (editingId === id) resetForm();
      fetchPermissions();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to delete permission"
      );
    }
  };

  const prettyModule = (m) =>
    m?.charAt(0)?.toUpperCase() + m?.slice(1)?.toLowerCase();

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white shadow-md">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Permission Center
            </h1>
            <p className="text-sm text-slate-500">
              Manage granular access rights used across roles and admins.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow border border-indigo-100">
            <ShieldCheck className="h-3 w-3 text-indigo-600" />
            <span className="font-medium text-slate-700">Total:</span>
            <span className="font-semibold text-indigo-600">
              {permissions.length}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow border border-emerald-100">
            {activeOnly ? (
              <ToggleRight className="h-3 w-3 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-3 w-3 text-slate-400" />
            )}
            <span className="font-medium text-slate-700">
              Active only filter
            </span>
          </div>
        </div>
      </div>

      {/* Layout: Form + List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="rounded-2xl border border-indigo-100 bg-white/90 shadow-sm shadow-indigo-100/60">
          <div className="border-b border-indigo-50 px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Permission" : "Create New Permission"}
              </h2>
              <p className="text-xs text-slate-500">
                Define a clear name, code and module for each permission.
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
            className="px-5 pb-5 pt-4 space-y-4 text-sm"
          >
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Display Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. "Admin List"`}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Code + Module */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Code (unique)
                </label>
                <input
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value.toUpperCase().replace(/\s+/g, "_")
                    )
                  }
                  placeholder="ADMIN_LIST"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-inner font-mono text-xs tracking-wide focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <p className="text-[11px] text-slate-400">
                  Used in backend checks. Keep it stable.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Module
                </label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short explanation of what this permission allows."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-inner resize-none focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className="flex items-center gap-1 text-xs text-slate-600"
                >
                  {isActive ? (
                    <ToggleRight className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-slate-400" />
                  )}
                  <span>{isActive ? "Active" : "Inactive"}</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Inactive permissions are hidden from role assignment.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-700"
              >
                <PlusCircle className="h-4 w-4" />
                {editingId ? "Update Permission" : "Create Permission"}
              </button>
            </div>
          </form>
        </div>

        {/* Right: List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Filters */}
          <div className="border-b border-slate-100 px-5 py-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Permission Registry
                </h2>
                <p className="text-[11px] text-slate-500">
                  Search, filter and manage existing permissions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-end">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name/code…"
                  className="w-40 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="all">All Modules</option>
                {MODULE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setActiveOnly((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700 hover:border-indigo-200"
              >
                {activeOnly ? (
                  <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-3.5 w-3.5 text-slate-400" />
                )}
                Active only
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="max-h-[540px] overflow-y-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name & Code</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-4 text-center text-slate-500"
                    >
                      Loading permissions…
                    </td>
                  </tr>
                )}

                {!loading && permissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-5 text-center text-slate-400"
                    >
                      No permissions found. Create one from the left panel.
                    </td>
                  </tr>
                )}

                {!loading &&
                  permissions.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {p.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {p.code}
                          </span>
                          {p.description && (
                            <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                              {p.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
                          {prettyModule(p.module || "General")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200"
                            title="Edit permission"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
                            title="Delete permission"
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
