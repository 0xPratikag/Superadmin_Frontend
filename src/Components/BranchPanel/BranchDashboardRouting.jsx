import React from "react";
import { Routes, Route } from "react-router-dom";
import BranchSidebar from "./BranchSidebar";
import BranchOverview from "./BranchOverview";
import BranchAppointments from "./BranchAppointments";
import BranchSettings from "./BranchSettings";

const BranchDashboardRouting = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-950">
      {/* Left: Branch sidebar */}
      <BranchSidebar />

      {/* Right: content */}
      <main className="flex-1 bg-slate-50">
        <Routes>
          {/* Overview (default) */}
          <Route path="/" element={<BranchOverview />} />
          <Route path="/overview" element={<BranchOverview />} />

          {/* Other sample pages */}
          <Route path="/appointments" element={<BranchAppointments />} />
          <Route path="/settings" element={<BranchSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default BranchDashboardRouting;
