import React from "react";
import { Settings } from "lucide-react";

const BranchSettings = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-md">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Branch Settings (Design Only)
            </h1>
            <p className="text-sm text-slate-500">
              Configure branch-level preferences once backend endpoints are
              ready.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
          You can add toggles for notifications, working hours, holiday
          calendar, branding options etc. later here.
        </div>
      </div>
    </div>
  );
};

export default BranchSettings;
