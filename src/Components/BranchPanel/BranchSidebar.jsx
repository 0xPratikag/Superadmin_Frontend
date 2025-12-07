import React, { useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  BarChart3,
  FileText,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    label: "Overview",
    path: "overview",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Appointments",
    path: "appointments",
    icon: <CalendarClock className="w-4 h-4" />,
  },
  {
    label: "Patients",
    path: "patients",
    icon: <Users className="w-4 h-4" />,
    disabled: true, // just for now – design only
  },
  {
    label: "Reports",
    path: "reports",
    icon: <FileText className="w-4 h-4" />,
    disabled: true,
  },
  {
    label: "Analytics",
    path: "analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    disabled: true,
  },
  {
    label: "Settings",
    path: "settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

const BranchSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { branchId } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const basePath = `/branch-dashboard/${branchId}`;

  const activeKey = useMemo(() => {
    const path = location.pathname.replace(basePath, "") || "/overview";
    const segments = path.split("/").filter(Boolean);
    return segments[0] || "overview";
  }, [location.pathname, basePath]);

  const handleNavigate = (item) => {
    if (item.disabled) return;
    const target =
      item.path === "overview" ? basePath : `${basePath}/${item.path}`;
    navigate(target);
  };

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-68 md:w-72"
      } relative flex h-screen flex-col border-r border-slate-900/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-3 text-slate-100 transition-[width] duration-200 ease-out`}
    >
      {/* top brand / branch label */}
      <div className="mb-4 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/40">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold leading-tight">
                Branch Dashboard
              </div>
              <div className="text-[11px] text-indigo-300/80">
                ID: {branchId?.slice(0, 6)}…
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-xl p-2 text-indigo-200 hover:bg-slate-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* nav items */}
      <nav className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-1 text-sm">
          {menuItems.map((item) => {
            const key = item.path;
            const isActive =
              key === "overview"
                ? activeKey === "overview"
                : activeKey === key;

            return (
              <li key={key}>
                <button
                  onClick={() => handleNavigate(item)}
                  disabled={item.disabled}
                  className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-inner shadow-indigo-500/30"
                      : "text-slate-200 hover:bg-slate-900/70"
                  } ${
                    item.disabled
                      ? "cursor-not-allowed opacity-50 hover:bg-transparent"
                      : ""
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/60 text-indigo-200 group-hover:bg-slate-900">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* footer: back to master */}
      <div className="mt-3 border-t border-slate-800/70 pt-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-900/80"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/70 text-indigo-200">
            <ArrowLeft className="h-4 w-4" />
          </span>
          {!collapsed && <span>Back to Master Panel</span>}
        </button>
      </div>
    </aside>
  );
};

export default BranchSidebar;
