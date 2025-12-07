import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Edit3,
  Trash2,
  Plus,
  Building2,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Optional: If you have a separate branch dashboard URL, set it in .env
// VITE_BRANCH_DASHBOARD_BASE_URL="https://branch-app.example.com"
const BRANCH_DASHBOARD_BASE_URL =
  import.meta.env.VITE_BRANCH_DASHBOARD_BASE_URL ||
  `${window.location.origin}/branch-dashboard`;

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/getAllBranches");
      setBranches(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch branches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;

    try {
      await axiosAuth.delete(`/deleteBranch/${id}`);
      toast.success("Branch deleted successfully");
      fetchBranches();
    } catch (err) {
      toast.error("Failed to delete branch");
      console.error(err);
    }
  };

  // Open branch dashboard in a new tab
  const openBranchDashboard = (branch) => {
    const url = `${BRANCH_DASHBOARD_BASE_URL}/${branch._id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredBranches = useMemo(() => {
    if (!filterText.trim()) return branches;

    const t = filterText.toLowerCase();
    return branches.filter(
      (b) =>
        b.Branch_name?.toLowerCase().includes(t) ||
        b.branch_email?.toLowerCase().includes(t)
    );
  }, [branches, filterText]);

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============== DATA TABLE CONFIG ============== */

  const columns = [
    {
      name: "Branch",
      selector: (row) => row.Branch_name,
      sortable: true,
      minWidth: "200px",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {row.Branch_name?.charAt(0)?.toUpperCase() || "B"}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-900">
              {row.Branch_name}
            </span>
            <span className="text-[11px] text-slate-500">
              {row.branch_email}
            </span>
          </div>
        </div>
      ),
    },
    {
      name: "Phone",
      selector: (row) => row.branch_phone || "",
      sortable: true,
      wrap: true,
      cell: (row) => (
        <span className="text-[13px] text-slate-700">
          {row.branch_phone || "—"}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => (row.isActive ? "Active" : "Inactive"),
      sortable: true,
      center: true,
      cell: (row) => (
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
      ),
    },
    {
      name: "Cloud / IP",
      sortable: false,
      minWidth: "220px",
      cell: (row) => (
        <div className="flex flex-col text-[11px] text-slate-500">
          <span>
            <span className="font-medium text-slate-600">IP:</span>{" "}
            {row.branch_ip || "—"}
          </span>
          <span>
            <span className="font-medium text-slate-600">Cloud ID:</span>{" "}
            {row.branch_cloudId || "—"}
          </span>
        </div>
      ),
    },
    {
      name: "Actions",
      right: true,
      minWidth: "150px",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {/* Open dashboard (new tab) */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent row click
              openBranchDashboard(row);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200"
            title="Open Branch Dashboard"
          >
            <ExternalLink className="h-4 w-4" />
          </button>

          {/* Edit */}
          <a
            href={`/branch/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200"
            title="Edit branch"
          >
            <Edit3 className="h-4 w-4" />
          </a>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
            title="Delete branch"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "transparent",
      },
    },
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

  return (
    <div className="w-full p-6 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-300/40">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
              <p className="text-sm text-slate-500">
                Manage all company branches and open their dashboards.
              </p>
            </div>
          </div>

          <a
            href="/branch/create"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-300/40 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Branch
          </a>
        </div>

        {/* Filter + quick stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm border border-slate-200">
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {branches.length}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-emerald-700 shadow-sm border border-emerald-100">
              Active:{" "}
              <span className="font-semibold">
                {branches.filter((b) => b.isActive).length}
              </span>
            </span>
          </div>

          <input
            type="text"
            placeholder="Search by name or email…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* DataTable */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={filteredBranches}
            progressPending={loading}
            pagination
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            onRowClicked={openBranchDashboard} // 👈 click row → open dashboard in new tab
            noDataComponent={
              <div className="py-8 text-sm text-slate-500">
                No branches found. Create one using the button above.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
