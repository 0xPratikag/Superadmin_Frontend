import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchBranchAttendance,
  fetchAttendanceLogs,
  updateApproval,
} from "./api";
import LogsModal from "./LogsModal";
function ymd(d) {
  // YYYY-MM-DD local
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtTime(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", { hour12: true });
  } catch {
    return String(dt);
  }
}

function statusBadge(s) {
  const v = (s || "pending").toLowerCase();
  const cls =
    v === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : v === "rejected"
      ? "bg-rose-50 text-rose-700 border-rose-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {v.toUpperCase()}
    </span>
  );
}

export default function BranchAttendance() {
  const { branchId } = useParams();
  const nav = useNavigate();
  const { state } = useLocation();

  const branchName = state?.branchName || "Branch Attendance";

  // default: from 12 days back to today (adjust as you like)
  const today = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(today.getDate() - 12);

  const [from, setFrom] = useState(ymd(defaultFrom));
  const [to, setTo] = useState(ymd(today));
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  // table state
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // logs modal
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTitle, setLogsTitle] = useState("");
  const [logsData, setLogsData] = useState([]);

  const load = async (opts = {}) => {
    setLoading(true);
    try {
      const res = await fetchBranchAttendance({
        branchId,
        from,
        to,
        status: status || undefined,
        q: q?.trim() || undefined,
        page: opts.page ?? page,
        limit: opts.limit ?? limit,
      });

      setRows(res?.data || []);
      setTotal(res?.total || 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // first load
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const applyFilters = () => {
    setPage(1);
    load({ page: 1 });
  };

  const openLogs = async (row) => {
    setLogsOpen(true);
    setLogsTitle(`${row.employee?.name || "Employee"} • ${ymd(row.date)}`);
    setLogsData(row.logs || []); // quick show

    setLogsLoading(true);
    try {
      // fetch fresh logs from API
      const res = await fetchAttendanceLogs(row._id);
      setLogsData(res?.logs || []);
    } catch (e) {
      console.error(e);
      // not fatal because we already show row.logs
    } finally {
      setLogsLoading(false);
    }
  };

  const doApproval = async (row, nextStatus) => {
    try {
      // quick optimistic update
      setRows((prev) =>
        prev.map((r) => (r._id === row._id ? { ...r, approvalStatus: nextStatus } : r))
      );

      await updateApproval(row._id, { status: nextStatus });
      toast.success(`Marked as ${nextStatus}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
      // reload to correct state
      load();
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: "Date",
        sortable: true,
        selector: (row) => row.date,
        cell: (row) => (
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-900">{ymd(row.date)}</span>
            <span className="text-[11px] text-slate-500">Doc date</span>
          </div>
        ),
        minWidth: "130px",
      },
      {
        name: "Employee",
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-900">
              {row.employee?.name || "—"}
            </span>
            <span className="text-[11px] text-slate-500">
              {row.employee?.machineEmpId ? `ID: ${row.employee.machineEmpId}` : "—"}
            </span>
          </div>
        ),
        minWidth: "220px",
      },
      {
        name: "First In",
        cell: (row) => <span className="text-[13px] text-slate-700">{fmtTime(row.firstIn)}</span>,
        minWidth: "180px",
      },
      {
        name: "Last Out",
        cell: (row) => <span className="text-[13px] text-slate-700">{fmtTime(row.lastOut)}</span>,
        minWidth: "180px",
      },
      {
        name: "Minutes",
        sortable: true,
        selector: (row) => row.totalMinutes ?? 0,
        center: true,
        cell: (row) => (
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {row.totalMinutes ?? 0}
          </span>
        ),
        minWidth: "110px",
      },
      {
        name: "Status",
        sortable: true,
        selector: (row) => row.approvalStatus,
        center: true,
        cell: (row) => statusBadge(row.approvalStatus),
        minWidth: "130px",
      },
      {
        name: "Actions",
        right: true,
        minWidth: "250px",
        cell: (row) => {
          const s = (row.approvalStatus || "pending").toLowerCase();
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openLogs(row);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" /> Logs
              </button>

              <button
                disabled={s === "approved"}
                onClick={(e) => {
                  e.stopPropagation();
                  doApproval(row, "approved");
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold
                ${s === "approved" ? "bg-emerald-100 text-emerald-600 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>

              <button
                disabled={s === "rejected"}
                onClick={(e) => {
                  e.stopPropagation();
                  doApproval(row, "rejected");
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold
                ${s === "rejected" ? "bg-rose-100 text-rose-600 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          );
        },
      },
    ];
  }, [rows]);

  const customStyles = {
    headCells: { style: { fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" } },
    rows: { style: { minHeight: "64px" } },
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav("/monitor/attendance")}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="text-2xl font-bold text-slate-900">{branchName}</div>
              <div className="text-sm text-slate-500">
                Attendance • {from} → {to}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
              Total rows: <span className="font-semibold text-slate-900">{total}</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[11px] font-semibold uppercase text-slate-500">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Employee name or machineEmpId…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <button
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Filter className="h-4 w-4" /> Apply
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={rows}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={total}
            paginationPerPage={limit}
            onChangePage={(p) => {
              setPage(p);
              load({ page: p });
            }}
            onChangeRowsPerPage={(newLimit, p) => {
              setLimit(newLimit);
              setPage(p);
              load({ page: p, limit: newLimit });
            }}
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            noDataComponent={<div className="py-10 text-sm text-slate-500">No attendance found for this filter.</div>}
          />
        </div>
      </div>

      <LogsModal
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        title={logsTitle}
        logs={logsData}
        loading={logsLoading}
      />
    </div>
  );
}
