import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";

const formatDateInput = (d) => d.toISOString().slice(0, 10);

const EmployeeAttendance = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // default: current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [from, setFrom] = useState(formatDateInput(firstDay));
  const [to, setTo] = useState(formatDateInput(lastDay));

  const summary = useMemo(() => {
    if (!records.length) return { days: 0, totalMinutes: 0 };
    const days = records.length;
    const totalMinutes = records.reduce(
      (sum, r) => sum + (r.totalMinutes || 0),
      0
    );
    return { days, totalMinutes };
  }, [records]);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      console.error(err);
      // silent
    }
  };

  const fetchAttendance = async () => {
    if (!from || !to) return;
    try {
      setLoading(true);
      const res = await api.get(
        `/employees/${id}/attendance`,
        {
          params: { from, to },
        }
      );
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApply = () => {
    fetchAttendance();
  };

  return (
    <div className="flex-1 p-6 bg-slate-950/80 text-slate-100">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Employee Attendance
          </h1>
          <p className="text-sm text-slate-400">
            Detailed attendance logs aggregated per day.
          </p>
          {employee && (
            <div className="mt-2 text-xs text-slate-300">
              <div>
                <span className="font-semibold">
                  {employee.name} ({employee.EmployeId})
                </span>{" "}
                – Machine ID: {employee.machineEmpId}
              </div>
              <div>
                Branch: {employee.branchAdmin?.Branch_name || "-"} | Role:{" "}
                {employee.role?.name || "-"}
              </div>
            </div>
          )}
        </div>

        {/* Date range filter */}
        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex gap-2">
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-slate-300">
                From (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs text-slate-300">
                To (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={handleApply}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
          <div className="text-xs text-slate-400">Days in range</div>
          <div className="mt-1 text-xl font-semibold text-white">
            {summary.days}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
          <div className="text-xs text-slate-400">Total minutes</div>
          <div className="mt-1 text-xl font-semibold text-white">
            {summary.totalMinutes}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
          <div className="text-xs text-slate-400">Total hours</div>
          <div className="mt-1 text-xl font-semibold text-white">
            {(summary.totalMinutes / 60).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/90 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">First In</th>
              <th className="px-4 py-3">Last Out</th>
              <th className="px-4 py-3">Total Minutes</th>
              <th className="px-4 py-3">Logs</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Loading attendance...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No attendance records in this range.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r._id}
                  className="border-t border-slate-800/60 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-2 text-sm">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-300">
                    {r.firstIn
                      ? new Date(r.firstIn).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-300">
                    {r.lastOut
                      ? new Date(r.lastOut).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-xs">{r.totalMinutes || 0}</td>
                  <td className="px-4 py-2 text-xs text-slate-400">
                    {r.logs && r.logs.length
                      ? r.logs
                          .map(
                            (l) =>
                              `${new Date(
                                l.time
                              ).toLocaleTimeString()} (${l.type || ""})`
                          )
                          .join(", ")
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

export default EmployeeAttendance;
