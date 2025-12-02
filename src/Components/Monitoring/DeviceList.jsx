import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // simple create form
  const [form, setForm] = useState({
    serialNumber: "",
    name: "",
    branchAdminId: "",
    location: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/devices");
      setDevices(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRefreshStatus = async () => {
    try {
      setRefreshing(true);
      await api.post("/devices/refresh-status");
      toast.success("Device status refreshed from iDMS");
      fetchDevices();
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh device status");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.serialNumber || !form.branchAdminId) {
      toast.warn("Serial number & Branch Admin ID are required");
      return;
    }
    try {
      setCreating(true);
      await api.post("/devices", form);
      toast.success("Device created");
      setForm({
        serialNumber: "",
        name: "",
        branchAdminId: "",
        location: "",
      });
      fetchDevices();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Error creating device"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-950/80 text-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Devices (Attendance Machines)
          </h1>
          <p className="text-sm text-slate-400">
            Map iDMS devices to admin branches and monitor status.
          </p>
        </div>
        <button
          onClick={handleRefreshStatus}
          disabled={refreshing}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh Status from iDMS"}
        </button>
      </div>

      {/* Create form (simple) */}
      <form
        onSubmit={handleCreate}
        className="mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-4"
      >
        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-300">Serial Number *</label>
          <input
            type="text"
            value={form.serialNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, serialNumber: e.target.value }))
            }
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="TW6000PW0..."
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-300">Name (optional)</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Main Gate"
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-300">Branch Admin ID *</label>
          <input
            type="text"
            value={form.branchAdminId}
            onChange={(e) =>
              setForm((f) => ({ ...f, branchAdminId: e.target.value }))
            }
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Mongo _id of Admin"
          />
          <span className="mt-1 text-xs text-slate-500">
            (Use id from /admin/list for now)
          </span>
        </div>
        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-300">Location (optional)</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Reception / 1st Floor"
          />
          <button
            type="submit"
            disabled={creating}
            className="mt-3 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {creating ? "Saving..." : "Add Device"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/90 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Serial Number</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Connected</th>
              <th className="px-4 py-3">Last Log</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Loading devices...
                </td>
              </tr>
            ) : devices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No devices found.
                </td>
              </tr>
            ) : (
              devices.map((d) => (
                <tr
                  key={d._id}
                  className="border-t border-slate-800/60 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-2 font-mono text-xs">
                    {d.serialNumber}
                  </td>
                  <td className="px-4 py-2">{d.name || "-"}</td>
                  <td className="px-4 py-2">
                    {d.branchAdmin?.Branch_name || "-"}
                  </td>
                  <td className="px-4 py-2">{d.location || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        d.lastKnownStatus === "Online"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : d.lastKnownStatus === "Offline"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {d.lastKnownStatus || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-400">
                    {d.lastConnected
                      ? new Date(d.lastConnected).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-400">
                    {d.lastLogTime
                      ? new Date(d.lastLogTime).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceList;
