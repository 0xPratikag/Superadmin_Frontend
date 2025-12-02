import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";

const todayStr = () => new Date().toISOString().slice(0, 10);

const AttendanceSync = () => {
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(todayStr());
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSync = async (e) => {
    e.preventDefault();
    if (!from || !to) {
      toast.warn("From & To dates required");
      return;
    }
    try {
      setLoading(true);
      setResult(null);
      const res = await api.post("/idms/sync-attendance", {
        from,
        to,
        deviceId: deviceId || undefined,
      });
      setResult(res.data);
      toast.success("Attendance sync started / completed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync attendance from iDMS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-950/80 text-slate-100">
      <h1 className="mb-2 text-2xl font-semibold text-white">
        Attendance Sync (iDMS → System)
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        Pull raw punch logs from iDMS and aggregate into Attendance collection.
      </p>

      <form
        onSubmit={handleSync}
        className="mb-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-3"
      >
        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-300">From (YYYY-MM-DD)</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-300">To (YYYY-MM-DD)</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-300">
            DeviceID (optional – iDMS SerialNumber)
          </label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="TW6000PW..."
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? "Syncing..." : "Sync from iDMS"}
          </button>
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
          <div className="mb-1 text-slate-200 font-semibold">
            Sync Result
          </div>
          <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-950/80 p-3 text-xs text-slate-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AttendanceSync;
