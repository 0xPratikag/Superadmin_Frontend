import React from "react";
import { CalendarClock } from "lucide-react";

const BranchAppointments = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-md">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Appointments (Design Only)
            </h1>
            <p className="text-sm text-slate-500">
              Later you can list branch-wise appointments here using APIs.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
          This is a placeholder layout. Add filters, calendar view, and table of
          appointments here when APIs are ready.
        </div>
      </div>
    </div>
  );
};

export default BranchAppointments;
