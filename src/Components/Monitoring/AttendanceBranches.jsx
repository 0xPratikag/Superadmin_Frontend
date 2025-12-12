import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { Building2, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAttendanceBranches } from "./api";

export default function AttendanceBranches() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAttendanceBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return branches;
    const t = q.toLowerCase();
    return branches.filter(
      (b) =>
        b.Branch_name?.toLowerCase().includes(t) ||
        b.branch_email?.toLowerCase().includes(t)
    );
  }, [q, branches]);

  const columns = [
    {
      name: "Branch",
      sortable: true,
      grow: 2,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-[13px] font-semibold text-slate-900">
              {row.Branch_name || "—"}
            </div>
            <div className="text-[11px] text-slate-500">{row.branch_email || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Employees",
      sortable: true,
      center: true,
      selector: (row) => row.employeeCount ?? 0,
      cell: (row) => (
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {row.employeeCount ?? 0}
        </span>
      ),
    },
    {
      name: "Devices",
      sortable: true,
      center: true,
      selector: (row) => row.deviceCount ?? 0,
      cell: (row) => (
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {row.deviceCount ?? 0}
        </span>
      ),
    },
    {
      name: "",
      right: true,
      cell: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/monitor/attendance/${row._id}`, {
              state: { branchName: row.Branch_name },
            });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Open <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const customStyles = {
    headCells: { style: { fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" } },
    rows: { style: { minHeight: "64px" } },
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
            <p className="text-sm text-slate-500">Select a branch to view and action attendance.</p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search branch…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={filtered}
            progressPending={loading}
            pagination
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            onRowClicked={(row) =>
              navigate(`/monitor/attendance/${row._id}`, {
                state: { branchName: row.Branch_name },
              })
            }
            noDataComponent={<div className="py-10 text-sm text-slate-500">No branches found.</div>}
          />
        </div>
      </div>
    </div>
  );
}
