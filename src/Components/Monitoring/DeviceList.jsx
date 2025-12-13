import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Cpu,
  RefreshCcw,
  DownloadCloud,
  Search,
  Eye,
  Trash2,
  Pencil,
  Building2,
  X,
  Check,
  TerminalSquare,
  Clock3,
  FileText,
  RotateCw,
  FilterX,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function getAuthClient() {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });
}

function fmt(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", { hour12: true });
  } catch {
    return String(dt);
  }
}

const Badge = ({ status }) => {
  const s = String(status || "Unknown").toLowerCase();
  const cls =
    s.includes("online") || s.includes("connect")
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : s.includes("offline") || s.includes("disconnect")
      ? "bg-rose-50 text-rose-700 border-rose-100"
      : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {String(status || "Unknown")}
    </span>
  );
};

function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] bg-black/40 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? (
          <div className="border-t border-slate-200 px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
      {children}
    </span>
  );
}

export default function DeviceList() {
  const api = useMemo(() => getAuthClient(), []);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // selectable rows (bulk actions)
  const [selectedRows, setSelectedRows] = useState([]);

  // modals
  const [rawOpen, setRawOpen] = useState(false);
  const [rawData, setRawData] = useState(null);

  const [idmsRawOpen, setIdmsRawOpen] = useState(false);
  const [idmsRawData, setIdmsRawData] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBranchId, setEditBranchId] = useState("");

  const [pullOpen, setPullOpen] = useState(false);
  const [pullFrom, setPullFrom] = useState("");
  const [pullTo, setPullTo] = useState("");
  const [pullBusy, setPullBusy] = useState(false);

  const [syncTimeOpen, setSyncTimeOpen] = useState(false);
  const [syncTimeValue, setSyncTimeValue] = useState(""); // ISO or local string
  const [syncBusy, setSyncBusy] = useState(false);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdBusy, setCmdBusy] = useState(false);
  const [commands, setCommands] = useState([]);

  const selectedSerials = useMemo(() => {
    return (selectedRows || []).map((r) => r.serialNumber).filter(Boolean);
  }, [selectedRows]);

  const fetchBranches = async () => {
    try {
      // ✅ preferred (new)
      const res = await api.get("/devices/branches");
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // fallback old
      try {
        const res2 = await api.get("/getAllBranches");
        setBranches(Array.isArray(res2.data) ? res2.data : []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchDevices = async (opts = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/devices", {
        params: {
          q: q?.trim() || undefined,
          status: status || undefined,
          branchId: branchId || undefined,
          page: opts.page ?? page,
          limit: opts.limit ?? limit,
          sort: "createdAt",
          order: "desc",
        },
      });
      setRows(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchDevices({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setPage(1);
    fetchDevices({ page: 1 });
  };

  const resetFilters = () => {
    setQ("");
    setStatus("");
    setBranchId("");
    setPage(1);
    fetchDevices({ page: 1, limit });
  };

  const syncFromIdms = async () => {
    try {
      toast.info("Syncing devices from iDMS…");
      await api.post("/devices/sync-from-idms");
      toast.success("Synced from iDMS");
      fetchDevices({ page: 1 });
    } catch (e) {
      console.error(e);
      toast.error("Sync failed");
    }
  };

  const refreshStatus = async () => {
    try {
      toast.info("Refreshing status from iDMS…");
      await api.post("/devices/refresh-status");
      toast.success("Status refreshed");
      fetchDevices();
    } catch (e) {
      console.error(e);
      toast.error("Refresh failed");
    }
  };

  const viewIdmsRawList = async () => {
    try {
      toast.info("Fetching iDMS raw devices…");
      const res = await api.get("/idms/devices/raw");
      setIdmsRawData(res.data);
      setIdmsRawOpen(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch iDMS raw list");
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditName(row.name || "");
    setEditLocation(row.location || "");
    const b = row.branch?._id || row.branchAdmin?._id || "";
    setEditBranchId(b);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editRow?._id) return;

    try {
      await api.put(`/devices/${editRow._id}`, {
        name: editName,
        location: editLocation,
      });

      if (editBranchId) {
        await api.patch(`/devices/${editRow._id}/assign-branch`, {
          branchId: editBranchId,
        });
      }

      toast.success("Device updated");
      setEditOpen(false);
      fetchDevices();
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };

  const del = async (row) => {
    if (!window.confirm(`Delete device ${row.serialNumber}?`)) return;
    try {
      await api.delete(`/devices/${row._id}`);
      toast.success("Deleted");
      fetchDevices();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  // --------- Commands ----------
  const fetchCommands = async () => {
    setCmdBusy(true);
    try {
      const res = await api.get("/devices/commands");
      setCommands(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch commands");
    } finally {
      setCmdBusy(false);
    }
  };

  const openCommands = async () => {
    setCmdOpen(true);
    await fetchCommands();
  };

  // --------- Pull Logs ----------
  const openPullLogs = (row = null) => {
    // default today window
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setPullFrom(`${yyyy}-${mm}-${dd} 00:00`);
    setPullTo(`${yyyy}-${mm}-${dd} 23:59`);

    if (row) setSelectedRows([row]); // single quick action
    setPullOpen(true);
  };

  const submitPullLogs = async () => {
    const serialNumbers = selectedSerials;
    if (!serialNumbers.length) {
      toast.error("Select at least 1 device");
      return;
    }

    setPullBusy(true);
    try {
      // ✅ Common payload (adjust keys if your backend expects different)
      const payload = {
        serialNumbers,
        from: pullFrom,
        to: pullTo,
      };

      await api.post("/devices/pull-logs", payload);
      toast.success("Pull logs command sent");
      setPullOpen(false);

      // show latest commands quickly
      // optional
      // await openCommands();
    } catch (e) {
      console.error(e);
      toast.error("Pull logs failed");
    } finally {
      setPullBusy(false);
    }
  };

  // --------- Sync Time ----------
  const openSyncTime = (row = null) => {
    if (row) setSelectedRows([row]);
    // default = now (ISO)
    setSyncTimeValue(new Date().toISOString().slice(0, 19)); // "YYYY-MM-DDTHH:mm:ss"
    setSyncTimeOpen(true);
  };

  const submitSyncTime = async () => {
    const serialNumbers = selectedSerials;
    if (!serialNumbers.length) {
      toast.error("Select at least 1 device");
      return;
    }

    setSyncBusy(true);
    try {
      const payload = {
        serialNumbers,
        dateTime: syncTimeValue, // backend can parse
      };

      await api.post("/devices/sync-time", payload);
      toast.success("Sync time command sent");
      setSyncTimeOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Sync time failed");
    } finally {
      setSyncBusy(false);
    }
  };

  const columns = [
    {
      name: "Device",
      grow: 2,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-[13px] font-semibold text-slate-900">
              {row.name || row.meta?.DeviceName || "Unnamed"}
            </div>
            <div className="text-[11px] text-slate-500">
              Serial: <span className="font-medium">{row.serialNumber}</span>
            </div>
            {row.location ? (
              <div className="text-[11px] text-slate-500">
                Location: <span className="font-medium">{row.location}</span>
              </div>
            ) : null}
          </div>
        </div>
      ),
      minWidth: "320px",
    },
    {
      name: "Branch",
      grow: 2,
      cell: (row) => {
        const b = row.branch || row.branchAdmin;
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-900">
                {b?.Branch_name || "—"}
              </span>
              <span className="text-[11px] text-slate-500">
                {b?.branch_email || "—"}
              </span>
            </div>
          </div>
        );
      },
      minWidth: "240px",
    },
    {
      name: "Status",
      center: true,
      cell: (row) => <Badge status={row.lastKnownStatus} />,
      minWidth: "140px",
    },
    {
      name: "Last Connected",
      cell: (row) => (
        <span className="text-[13px] text-slate-700">
          {fmt(row.lastConnected)}
        </span>
      ),
      minWidth: "190px",
    },
    {
      name: "Last Log",
      cell: (row) => (
        <span className="text-[13px] text-slate-700">
          {fmt(row.lastLogTime)}
        </span>
      ),
      minWidth: "190px",
    },
    {
      name: "Quick",
      right: true,
      minWidth: "260px",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {/* raw row payload */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRawData(row.meta || row);
              setRawOpen(true);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            title="View Raw"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* pull logs */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPullLogs(row);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            title="Pull Logs"
          >
            <FileText className="h-4 w-4" />
          </button>

          {/* sync time */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openSyncTime(row);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200"
            title="Sync Time"
          >
            <Clock3 className="h-4 w-4" />
          </button>

          {/* edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              del(row);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#64748b",
        textTransform: "uppercase",
      },
    },
    rows: { style: { minHeight: "72px" } },
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Devices</h1>
            <p className="text-sm text-slate-500">
              Sync devices from iDMS, refresh status, assign branch & run
              commands.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* <button
              onClick={syncFromIdms}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <DownloadCloud className="h-4 w-4" /> Sync from iDMS
            </button> */}
            <button
              onClick={refreshStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh Status
            </button>

            {/* <button
              onClick={() => openPullLogs(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 border border-indigo-100 hover:bg-indigo-100"
              title="Pull logs for selected devices"
            >
              <FileText className="h-4 w-4" /> Pull Logs
            </button> */}

            {/* <button
              onClick={() => openSyncTime(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 border border-sky-100 hover:bg-sky-100"
              title="Sync time for selected devices"
            >
              <Clock3 className="h-4 w-4" /> Sync Time
            </button> */}

            {/* <button
              onClick={openCommands}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
              title="View device commands"
            >
              <TerminalSquare className="h-4 w-4" /> Commands
            </button> */}

            {/* <button
              onClick={viewIdmsRawList}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
              title="View full iDMS raw device list"
            >
              <RotateCw className="h-4 w-4" /> iDMS Raw
            </button> */}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <Pill>
            Total:{" "}
            <span className="ml-1 font-semibold text-slate-900">{total}</span>
          </Pill>
          <Pill>
            Selected:{" "}
            <span className="ml-1 font-semibold text-slate-900">
              {selectedSerials.length}
            </span>
          </Pill>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Serial or device name…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="min-w-[200px]">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Branch
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.Branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[180px]">
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                Status
              </label>
              <input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder='e.g. "Online"'
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Check className="h-4 w-4" /> Apply
            </button>

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
            >
              <FilterX className="h-4 w-4" /> Reset
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
              fetchDevices({ page: p });
            }}
            onChangeRowsPerPage={(newLimit, p) => {
              setLimit(newLimit);
              setPage(p);
              fetchDevices({ page: p, limit: newLimit });
            }}
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            selectableRows
            onSelectedRowsChange={({ selectedRows }) =>
              setSelectedRows(selectedRows)
            }
            clearSelectedRows={false}
            noDataComponent={
              <div className="py-10 text-sm text-slate-500">
                No devices found.
              </div>
            }
          />
        </div>
      </div>

      {/* Row Raw Modal */}
      <Modal
        open={rawOpen}
        title="Raw Device Payload"
        onClose={() => setRawOpen(false)}
      >
        <pre className="max-h-[60vh] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </Modal>

      {/* Full iDMS Raw Modal */}
      <Modal
        open={idmsRawOpen}
        title="iDMS Raw Devices List"
        onClose={() => setIdmsRawOpen(false)}
      >
        <pre className="max-h-[60vh] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
          {JSON.stringify(idmsRawData, null, 2)}
        </pre>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        title="Edit Device"
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-500">
              Name
            </label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-500">
              Location
            </label>
            <input
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-500">
              Assign Branch
            </label>
            <select
              value={editBranchId}
              onChange={(e) => setEditBranchId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">— Select —</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.Branch_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Pull Logs Modal */}
      <Modal
        open={pullOpen}
        title="Pull Logs (Selected Devices)"
        onClose={() => setPullOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500">
              Selected devices:{" "}
              <span className="font-semibold text-slate-800">
                {selectedSerials.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPullOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={pullBusy}
                onClick={submitPullLogs}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {pullBusy ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Send Command
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Payload sent to backend:
            <div className="mt-2 font-mono text-[11px] text-slate-800">
              {"{ serialNumbers: [...], from, to }"}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              (Agar backend keys different hain to payload keys rename kar
              dena.)
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                From (YYYY-MM-DD HH:mm)
              </label>
              <input
                value={pullFrom}
                onChange={(e) => setPullFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-500">
                To (YYYY-MM-DD HH:mm)
              </label>
              <input
                value={pullTo}
                onChange={(e) => setPullTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500">
              Devices
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSerials.length ? (
                selectedSerials.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <div className="text-sm text-rose-600">
                  No device selected. Select from table first.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Sync Time Modal */}
      <Modal
        open={syncTimeOpen}
        title="Sync Time (Selected Devices)"
        onClose={() => setSyncTimeOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500">
              Selected devices:{" "}
              <span className="font-semibold text-slate-800">
                {selectedSerials.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSyncTimeOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={syncBusy}
                onClick={submitSyncTime}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {syncBusy ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock3 className="h-4 w-4" />
                )}
                Send Command
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Payload sent to backend:
            <div className="mt-2 font-mono text-[11px] text-slate-800">
              {"{ serialNumbers: [...], dateTime }"}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-500">
              DateTime (ISO or backend supported)
            </label>
            <input
              value={syncTimeValue}
              onChange={(e) => setSyncTimeValue(e.target.value)}
              placeholder="YYYY-MM-DDTHH:mm:ss"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
            <div className="mt-1 text-xs text-slate-500">
              Example: <span className="font-mono">2025-12-13T10:35:00</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500">
              Devices
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSerials.length ? (
                selectedSerials.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <div className="text-sm text-rose-600">
                  No device selected. Select from table first.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Commands Modal */}
      <Modal
        open={cmdOpen}
        title="Device Commands"
        onClose={() => setCmdOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={fetchCommands}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
            >
              {cmdBusy ? (
                <RotateCw className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
              Refresh
            </button>
            <button
              onClick={() => setCmdOpen(false)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            Here you can monitor commands sent to devices (pull logs / sync time
            etc).
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="max-h-[55vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] uppercase text-slate-500">
                    <th className="px-3 py-2 text-left">Created</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Devices</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(commands || []).length ? (
                    commands.map((c, idx) => (
                      <tr
                        key={c._id || idx}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {fmt(c.createdAt || c.created_on)}
                        </td>
                        <td className="px-3 py-2">
                          _toggle:{/* */}
                          <span className="font-semibold text-slate-800">
                            {c.type || c.commandType || c.action || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {(c.serialNumbers || c.devices || c.deviceIds || [])
                            .slice(0, 3)
                            .join(", ")}
                          {(c.serialNumbers || c.devices || c.deviceIds || [])
                            .length > 3
                            ? " …"
                            : ""}
                        </td>
                        <td className="px-3 py-2">
                          <Badge status={c.status || c.state || "pending"} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-slate-500"
                      >
                        No commands found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            If your backend returns a different shape, just map keys:
            <div className="mt-1 font-mono text-[11px] text-slate-800">
              type/status/serialNumbers/createdAt
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
