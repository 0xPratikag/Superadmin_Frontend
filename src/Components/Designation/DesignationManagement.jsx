import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Tags,
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Info,
  Hash,
  Type,
  ListOrdered,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// BACKEND wale hi keys – sirf info ke liye (no dropdown matching)
const DESIGNATION_KEYS = [
  "principal",
  "teacher",
  "admin",
  "accountant",
  "assistant_therapist",
  "cleaner",
  "clinical_psychologist",
  "gardener",
  "guard",
  "hr",
  "house_keeping",
  "night_guard",
  "occupational_therapist",
  "physiotherapist",
  "project_manager",
  "psychotherapist",
  "sbi",
  "speech_therapist",
  "sports_teacher",
  "supervisor",
  "superadmin",
  "user",
];

const prettyLabel = (str = "") =>
  str
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ✅ Zod schemas
const CreateDesignationSchema = z.object({
  key: z
    .string()
    .min(1, "Designation key is required")
    .max(100, "Key too long"),
  label: z
    .string()
    .max(80, "Label too long")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(200, "Description too long")
    .optional()
    .or(z.literal("")),
  order: z
    .string()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

const EditDesignationSchema = z.object({
  label: z
    .string()
    .max(80, "Label too long")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(200, "Description too long")
    .optional()
    .or(z.literal("")),
  order: z
    .string()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

export default function DesignationManagement() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  /* ========== FETCH ========== */

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/getAllDesignation");
      const data = res.data || [];
      setDesignations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch designations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========== CREATE FORM ========== */

  const {
    register,
    handleSubmit,
    reset: resetCreate,
    setValue,
    watch,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm({
    resolver: zodResolver(CreateDesignationSchema),
    defaultValues: {
      key: "",
      label: "",
      description: "",
      order: "",
      isActive: true,
    },
  });

  // 👇 key change hone par label auto-fill
  const watchedKey = watch("key");
  useEffect(() => {
    if (watchedKey && watchedKey.trim()) {
      const auto = prettyLabel(watchedKey);
      setValue("label", auto, { shouldValidate: false, shouldDirty: false });
    } else {
      setValue("label", "", { shouldValidate: false, shouldDirty: false });
    }
  }, [watchedKey, setValue]);

  const onCreateSubmit = async (values) => {
    try {
      const payload = {
        key: values.key.toLowerCase().trim(),
        label: values.label?.trim() || undefined, // backend bhi prettyLabel karega agar empty ho
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
        order:
          values.order && !Number.isNaN(Number(values.order))
            ? Number(values.order)
            : undefined,
      };

      await axiosAuth.post("/createDesignation", payload);
      toast.success("Designation created successfully");
      resetCreate();
      fetchDesignations();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to create designation"
      );
    }
  };

  /* ========== EDIT FORM ========== */

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isUpdating },
  } = useForm({
    resolver: zodResolver(EditDesignationSchema),
    defaultValues: {
      label: "",
      description: "",
      order: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!editingItem) return;
    resetEdit({
      label: editingItem.label || "",
      description: editingItem.description || "",
      order:
        typeof editingItem.order === "number"
          ? String(editingItem.order)
          : "",
      isActive: editingItem.isActive ?? true,
    });
  }, [editingItem, resetEdit]);

  const onEditSubmit = async (values) => {
    if (!editingItem) return;

    try {
      const payload = {
        label: values.label?.trim() || undefined,
        description: values.description?.trim() || "",
        isActive: values.isActive,
        order:
          values.order && !Number.isNaN(Number(values.order))
            ? Number(values.order)
            : undefined,
      };

      await axiosAuth.put(
        `/updateDesignation/${editingItem._id}`,
        payload
      );
      toast.success("Designation updated");
      setEditingItem(null);
      fetchDesignations();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update designation"
      );
    }
  };

  /* ========== DELETE / TOGGLE ========== */

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Delete designation "${row.label}" (${row.key})? This cannot be undone.`
      )
    )
      return;

    try {
      await axiosAuth.delete(`/deleteDesignation/${row._id}`);
      toast.success("Designation deleted");
      fetchDesignations();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete designation. It may be linked to roles."
      );
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      await axiosAuth.put(`/updateDesignation/${row._id}`, {
        isActive: !row.isActive,
      });

      toast.success(
        `Designation ${!row.isActive ? "activated" : "deactivated"}`
      );

      setDesignations((prev) =>
        prev.map((d) =>
          d._id === row._id ? { ...d, isActive: !row.isActive } : d
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle status");
    }
  };

  /* ========== FILTERS & STATS ========== */

  const filteredDesignations = useMemo(() => {
    let data = [...designations];

    if (filterText.trim()) {
      const t = filterText.toLowerCase();
      data = data.filter(
        (d) =>
          d.key?.toLowerCase().includes(t) ||
          d.label?.toLowerCase().includes(t) ||
          d.description?.toLowerCase().includes(t)
      );
    }

    if (statusFilter !== "all") {
      const desired = statusFilter === "active";
      data = data.filter((d) => d.isActive === desired);
    }

    return data;
  }, [designations, filterText, statusFilter]);

  const total = designations.length;
  const activeCount = designations.filter((d) => d.isActive).length;
  const systemCount = designations.filter((d) => d.isSystem).length;
  const customCount = designations.filter((d) => !d.isSystem).length;

  /* ========== TABLE CONFIG ========== */

  const columns = [
    {
      name: "Label",
      selector: (row) => row.label,
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-900">
            {row.label}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Hash className="h-3 w-3 text-slate-400" />
              {row.key}
            </span>
            {row.isSystem && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-100">
                System
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      name: "Description",
      selector: (row) => row.description || "",
      sortable: false,
      minWidth: "260px",
      cell: (row) => (
        <span className="text-[12px] text-slate-600">
          {row.description || "—"}
        </span>
      ),
    },
    {
      name: "Order",
      selector: (row) => row.order ?? 0,
      sortable: true,
      width: "80px",
      center: true,
      cell: (row) => (
        <span className="text-[12px] text-slate-700">
          {row.order ?? 0}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => (row.isActive ? "Active" : "Inactive"),
      sortable: true,
      width: "130px",
      center: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              row.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}
          >
            <span
              className={`mr-1 block h-1.5 w-1.5 rounded-full ${
                row.isActive ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className="text-slate-400 hover:text-slate-700"
            title="Toggle status"
          >
            {row.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
    {
      name: "Actions",
      right: true,
      width: "120px",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingItem(row);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200"
            title="Edit designation"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
            title="Delete designation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    table: { style: { backgroundColor: "transparent" } },
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        borderBottomWidth: "1px",
        borderBottomColor: "#e2e8f0",
      },
    },
    headCells: {
      style: {
        fontSize: "11px",
        textTransform: "uppercase",
        color: "#64748b",
        fontWeight: 600,
      },
    },
    rows: {
      style: {
        fontSize: "13px",
        color: "#0f172a",
        minHeight: "56px",
        "&:not(:last-of-type)": {
          borderBottomWidth: "1px",
          borderBottomColor: "#e5e7eb",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f8fafc",
        transition: "background-color 0.15s ease",
      },
    },
    pagination: {
      style: {
        borderTopWidth: "1px",
        borderTopColor: "#e5e7eb",
      },
    },
  };

  const inputBase =
    "w-full rounded-lg border px-3 py-2 bg-slate-50 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 " +
    "placeholder:text-slate-400";

  const labelBase =
    "flex items-center gap-1 text-xs font-medium text-slate-700 mb-1";

  const errorText = (msg) =>
    msg ? <p className="mt-1 text-[11px] text-rose-500">{msg}</p> : null;

  /* ========== RENDER ========== */

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-300/40">
              <Tags className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Designations
              </h1>
              <p className="text-sm text-slate-500">
                Manage designation keys, labels and ordering for roles & employees.
              </p>
            </div>
          </div>

          <button
            onClick={fetchDesignations}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Total Designations</p>
              <p className="text-lg font-semibold text-slate-900">{total}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Active</p>
              <p className="text-lg font-semibold text-slate-900">
                {activeCount}
              </p>
              <p className="text-[11px] text-slate-400">
                Inactive: {total - activeCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">System / Custom</p>
              <p className="text-lg font-semibold text-slate-900">
                {systemCount} / {customCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] text-slate-500 mb-1">
              Allowed keys (backend enum)
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed max-h-16 overflow-y-auto">
              {DESIGNATION_KEYS.join(", ")}
            </p>
          </div>
        </div>

        {/* Create Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white/95 shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                  New Designation
                </p>
                <p className="text-[11px] text-slate-500">
                  Designation key type karo (e.g. <b>teacher</b>) – label
                  automatic fill ho jayega. Description & order optional.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onCreateSubmit)}
            className="px-5 py-4 grid gap-4 md:grid-cols-3 text-sm"
          >
            {/* Key */}
            <div>
              <label className={labelBase}>
                <Hash className="h-3.5 w-3.5 text-indigo-500" />
                Designation Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. teacher, principal, admin"
                className={inputBase}
                {...register("key")}
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Must be one of the allowed keys shown above (backend enum).
              </p>
              {errorText(createErrors.key?.message)}
            </div>

            {/* Label (auto-filled) */}
            <div>
              <label className={labelBase}>
                <Type className="h-3.5 w-3.5 text-indigo-500" />
                Label
                <span className="ml-1 text-[10px] font-normal text-slate-400">
                  (auto from key – editable)
                </span>
              </label>
              <input
                type="text"
                placeholder="Admin, Teacher, Principal…"
                className={inputBase}
                {...register("label")}
              />
              {errorText(createErrors.label?.message)}
            </div>

            {/* Order + Active */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
              <div>
                <label className={labelBase}>
                  <ListOrdered className="h-3.5 w-3.5 text-indigo-500" />
                  Order
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className={inputBase}
                  {...register("order")}
                />
                {errorText(createErrors.order?.message)}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create_isActive"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  {...register("isActive")}
                  defaultChecked
                />
                <label
                  htmlFor="create_isActive"
                  className="text-xs font-medium text-slate-700"
                >
                  Active
                </label>
              </div>
            </div>

            {/* Description full width */}
            <div className="md:col-span-3">
              <label className={labelBase}>
                <Info className="h-3.5 w-3.5 text-indigo-500" />
                Description
                <span className="ml-1 text-[10px] font-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <textarea
                rows={2}
                placeholder="Short explanation for admins (e.g. 'Can manage fees and accounts')"
                className={`${inputBase} resize-none`}
                {...register("description")}
              />
              {errorText(createErrors.description?.message)}
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => resetCreate()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
              <motion.button
                type="submit"
                disabled={isCreating}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-300/40 hover:bg-indigo-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCreating ? "Creating…" : "Create Designation"}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Filter + table */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm border border-slate-200">
              Total:{" "}
              <span className="font-semibold text-slate-900">{total}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-emerald-700 shadow-sm border border-emerald-100">
              Active:{" "}
              <span className="font-semibold">{activeCount}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search label / key / description…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredDesignations}
            progressPending={loading}
            pagination
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            noDataComponent={
              <div className="py-8 text-sm text-slate-500">
                No designations found. Create one using the form above.
              </div>
            }
          />
        </div>

        {/* Edit Drawer / Card */}
        <AnimatePresence>
          {editingItem && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:pb-6"
            >
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                      Edit Designation
                    </p>
                    <p className="text-sm text-slate-500">
                      {editingItem.label} ({editingItem.key})
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form
                  onSubmit={handleEditSubmit(onEditSubmit)}
                  className="px-5 pt-4 pb-5 space-y-4 text-sm"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelBase}>
                        <Type className="h-3.5 w-3.5 text-indigo-500" />
                        Label
                      </label>
                      <input
                        type="text"
                        className={inputBase}
                        {...registerEdit("label")}
                      />
                      {errorText(editErrors.label?.message)}
                    </div>

                    <div>
                      <label className={labelBase}>
                        <ListOrdered className="h-3.5 w-3.5 text-indigo-500" />
                        Order
                      </label>
                      <input
                        type="number"
                        className={inputBase}
                        {...registerEdit("order")}
                      />
                      {errorText(editErrors.order?.message)}
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>
                      <Info className="h-3.5 w-3.5 text-indigo-500" />
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className={`${inputBase} resize-none`}
                      {...registerEdit("description")}
                    />
                    {errorText(editErrors.description?.message)}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="edit_isActive"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      {...registerEdit("isActive")}
                    />
                    <label
                      htmlFor="edit_isActive"
                      className="text-xs font-medium text-slate-700"
                    >
                      Active designation
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isUpdating}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-300/40 hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isUpdating ? "Saving…" : "Save Changes"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
