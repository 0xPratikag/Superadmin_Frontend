// src/pages/Employee/EmployeeList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  UserCircle2,
  Users2,
  Briefcase,
  Building2,
  MapPin,
  Activity,
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/getEmployees", {
        params: {
          // basic server-side pagination support
          page: 1,
          limit: 1000,
        },
      });

      const data = res.data?.data || res.data || [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axiosAuth.get("/getAllBranches");
      const data = res.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      // branch fetch fail is not critical, so no toast
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axiosAuth.delete(`/deleteEmployee/${id}`);
      toast.success("Employee deleted");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete employee");
    }
  };

  const handleToggleStatus = async (row) => {
    const newStatus = !row.isActive;
    try {
      await axiosAuth.patch(`/toggleEmployeeStatus/${row._id}/status`, {
        isActive: newStatus,
      });
      toast.success(
        `Employee ${newStatus ? "activated" : "deactivated"} successfully`
      );
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === row._id ? { ...emp, isActive: newStatus } : emp
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========== FILTERED DATA ========== */

  const filteredEmployees = useMemo(() => {
    let data = [...employees];

    if (searchText.trim()) {
      const t = searchText.toLowerCase();
      data = data.filter((emp) => {
        const branchName =
          emp.branch?.Branch_name || emp.branch?.name || "";
        return (
          emp.name?.toLowerCase().includes(t) ||
          emp.email?.toLowerCase().includes(t) ||
          emp.EmployeId?.toLowerCase().includes(t) ||
          branchName.toLowerCase().includes(t) ||
          emp.location?.toLowerCase().includes(t)
        );
      });
    }

    if (selectedBranch) {
      data = data.filter(
        (emp) => emp.branch?._id === selectedBranch.value
      );
    }

    if (statusFilter !== "all") {
      const desired = statusFilter === "active";
      data = data.filter((emp) => emp.isActive === desired);
    }

    return data;
  }, [employees, searchText, selectedBranch, statusFilter]);

  /* ========== RECHARTS DATA ========== */

  const statusChartData = useMemo(() => {
    const active = employees.filter((e) => e.isActive).length;
    const inactive = employees.filter((e) => !e.isActive).length;
    return [
      { name: "Active", value: active },
      { name: "Inactive", value: inactive },
    ];
  }, [employees]);

  const branchChartData = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => {
      const name =
        e.branch?.Branch_name || e.branch?.name || "Unassigned";
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [employees]);

  const COLORS = ["#22c55e", "#ef4444", "#6366f1", "#0ea5e9", "#f97316"];

  /* ========== TABLE CONFIG ========== */

  const columns = [
    {
      name: "Employee",
      selector: (row) => row.name,
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {row.name?.charAt(0)?.toUpperCase() || "E"}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-900">
              {row.name}
            </span>
            <span className="text-[11px] text-slate-500">
              {row.email}
            </span>
            <span className="text-[11px] text-slate-400">
              ID: {row.EmployeId}
            </span>
          </div>
        </div>
      ),
    },
    {
      name: "Role",
      selector: (row) => row.role?.name || "",
      sortable: true,
      minWidth: "140px",
      cell: (row) => (
        <div className="flex items-center gap-1 text-[12px] text-slate-700">
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
          <span>{row.role?.name || "—"}</span>
        </div>
      ),
    },
    {
      name: "Branch",
      selector: (row) =>
        row.branch?.Branch_name ||
        row.branch?.name ||
        "",
      sortable: true,
      minWidth: "180px",
      cell: (row) => (
        <div className="flex flex-col text-[11px] text-slate-600">
          <span className="font-medium">
            {row.branch?.Branch_name || row.branch?.name || "Unassigned"}
          </span>
          {row.branch?.location && (
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3" />
              {row.branch.location}
            </span>
          )}
        </div>
      ),
    },
    {
      name: "Machine ID",
      selector: (row) => row.machineEmpId,
      sortable: true,
      center: true,
      cell: (row) => (
        <span className="text-[13px] text-slate-700">
          {row.machineEmpId}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => (row.isActive ? "Active" : "Inactive"),
      sortable: true,
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
      minWidth: "150px",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <a
            href={`/employee/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200"
            title="Edit employee"
          >
            <Edit3 className="h-4 w-4" />
          </a>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
            title="Delete employee"
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

  /* ========== UI ========== */

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: b.Branch_name || b.name || "Unnamed branch",
  }));

  return (
    <div className="w-full p-6 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-300/40">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Employees
              </h1>
              <p className="text-sm text-slate-500">
                Manage employee records, roles, branches and status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmployees}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <a
              href="/employee/create"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-300/40 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add Employee
            </a>
          </div>
        </div>

        {/* Stats + charts */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Employees</p>
              <p className="text-xl font-semibold text-slate-900">
                {employees.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-xl font-semibold text-slate-900">
                {employees.filter((e) => e.isActive).length}
              </p>
              <p className="text-[11px] text-slate-400">
                Inactive: {employees.filter((e) => !e.isActive).length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Branches Covered</p>
              <p className="text-xl font-semibold text-slate-900">
                {
                  new Set(
                    employees
                      .map(
                        (e) =>
                          e.branch?._id ||
                          (e.branch ? JSON.stringify(e.branch) : "")
                      )
                      .filter(Boolean)
                  ).size
                }
              </p>
              <p className="text-[11px] text-slate-400">
                Based on mapped branch
              </p>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
              Status Overview
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={(entry) =>
                      `${entry.name} (${entry.value})`
                    }
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Active"
                            ? "#22c55e"
                            : "#ef4444"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
              Employees per Branch
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm border border-slate-200">
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {employees.length}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-emerald-700 shadow-sm border border-emerald-100">
              Active:{" "}
              <span className="font-semibold">
                {employees.filter((e) => e.isActive).length}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search name, email, ID, branch…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />

            <div className="w-48">
              <Select
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active Only" },
                  { value: "inactive", label: "Inactive Only" },
                ]}
                value={
                  statusFilter
                    ? {
                        value: statusFilter,
                        label:
                          statusFilter === "all"
                            ? "All Status"
                            : statusFilter === "active"
                            ? "Active Only"
                            : "Inactive Only",
                      }
                    : null
                }
                onChange={(opt) => setStatusFilter(opt?.value || "all")}
                classNamePrefix="react-select"
                placeholder="Status"
              />
            </div>

            <div className="w-56">
              <Select
                options={branchOptions}
                value={selectedBranch}
                onChange={setSelectedBranch}
                isClearable
                classNamePrefix="react-select"
                placeholder="Filter by branch"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={filteredEmployees}
            progressPending={loading}
            pagination
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            noDataComponent={
              <div className="py-8 text-sm text-slate-500">
                No employees found. Create one using the button above.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
