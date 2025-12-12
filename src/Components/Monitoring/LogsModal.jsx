import React from "react";
import { X } from "lucide-react";

function fmt(dt) {
  try {
    return new Date(dt).toLocaleString("en-IN", { hour12: true });
  } catch {
    return String(dt);
  }
}

export default function LogsModal({ open, onClose, title, logs = [], loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="text-xs text-slate-500">Logs (in/out)</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto p-5">
          {loading ? (
            <div className="text-sm text-slate-500">Loading logs…</div>
          ) : logs?.length ? (
            <div className="space-y-2">
              {logs.map((l, idx) => (
                <div
                  key={l._id || idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Time</span>
                    <span className="text-sm font-semibold text-slate-900">{fmt(l.time)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span
                      className={`inline-flex justify-end rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        l.type === "in"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {String(l.type || "").toUpperCase()}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      Device: <span className="font-medium text-slate-700">{l.deviceId || "—"}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No logs found.</div>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
