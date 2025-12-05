import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  UserPlus,
  KeyRound,
  MailPlus,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

/* ---------- MENU STRUCTURE (unchanged data, same routes/icons) ---------- */
/* ---------- MENU STRUCTURE (unchanged data, same routes/icons) ---------- */
const modules = [


    {
    name: "Permission Management",
    path: "/permission",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
        {
        name: "Permissions Master", // Permission CRUD
        path: "/permissions",
        icon: <KeyRound className="w-4 h-4 text-indigo-300" />,
      },
      

    ],
  },



      {
    name: "Role Management",
    path: "/role",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
    
      {
        name: "Roles Mapping", // Role CRUD
        path: "/roles",
        icon: <ShieldCheck className="w-4 h-4 text-indigo-300" />,
      },

    ],
  },






  {
    name: "Admin",
    path: "/admin",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
      {
        name: "Admin List",
        path: "/admin/list",
        icon: <Users className="w-4 h-4 text-indigo-300" />,
      },
      {
        name: "Create Admin",
        path: "/admin/create",
        icon: <UserPlus className="w-4 h-4 text-indigo-300" />,
      },
      {
        name: "Admin's Permissions",
        path: "/admin/roles-permissions",
        icon: <KeyRound className="w-4 h-4 text-indigo-300" />,
      },
    ],
  },
  {
    name: "Therapist",
    path: "/therapist",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
      {
        name: "Therapist List",
        path: "/therapist/list",
        icon: <Users className="w-4 h-4 text-indigo-300" />,
      },
      {
        name: "Create Therapist",
        path: "/therapist/create",
        icon: <UserPlus className="w-4 h-4 text-indigo-300" />,
      },
    ],
  },
  {
    name: "Assistant",
    path: "/assistant",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
      {
        name: "Assistant List",
        path: "/assistant/list",
        icon: <Users className="w-4 h-4 text-indigo-300" />,
      },
      {
        name: "Create Assistant",
        path: "/assistant/create",
        icon: <UserPlus className="w-4 h-4 text-indigo-300" />,
      },
    ],
  },

  // 🆕 Monitoring / Attendance / Machines
  {
    name: "Monitoring",
    path: "/monitor",
    icon: <ShieldCheck className="w-5 h-5" />,
    children: [
      {
        name: "Devices",
        path: "/monitor/devices",
        icon: <Users className="w-4 h-4 text-indigo-300" />,
      },
      {
        name: "Employees",
        path: "/monitor/employees",
        icon: <Users className="w-4 h-4 text-indigo-300" />,
      },
      {
        name: "Attendance Sync",
        path: "/monitor/attendance-sync",
        icon: <KeyRound className="w-4 h-4 text-indigo-300" />,
      },
    ],
  },

  { name: "Settings", path: "/settingPage", icon: <Settings className="w-5 h-5" /> },
  { name: "Logout", path: "/authentication", icon: <LogOut className="w-5 h-5" /> },
];


/* ---------- UTIL ---------- */
const isActive = (location, itemPath) =>
  location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");

/* ---------- EXPANDED MENU ITEM (recursive) ---------- */
const ExpandedItem = ({ item, depth = 0, location, navigate, openMenus, toggleMenu, forceOpen = false }) => {
  const active = isActive(location, item.path);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isOpen = !!openMenus[item.path] || active || forceOpen;

  return (
    <li className="relative select-none">
      <button
        onClick={() => (hasChildren ? toggleMenu(item.path) : navigate(item.path))}
        className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
          ${active ? "bg-indigo-700/70 text-white shadow-inner" : "text-slate-200 hover:bg-indigo-800/60"}
        `}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-current={active ? "page" : undefined}
      >
        {/* Active accent bar */}
        <span
          className={`absolute left-0 top-1 bottom-1 w-1 rounded-full transition-transform ${
            active ? "bg-indigo-400 scale-y-100" : "bg-transparent scale-y-0"
          }`}
        />
        <span className="ml-1" />
        {item.icon}
        <span className="truncate text-sm font-medium" style={{ marginLeft: depth ? 4 : 0 }}>
          {item.name}
        </span>
        {hasChildren && (
          <ChevronDown
            className={`ml-auto h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        )}
      </button>

      {hasChildren && (
        <ul
          className={`ml-7 overflow-hidden pl-1 transition-[max-height,opacity,transform] duration-300 ease-in-out
            ${isOpen ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"}
          `}
          role="group"
        >
          {item.children.map((child) => (
            <ExpandedItem
              key={child.path}
              item={child}
              depth={depth + 1}
              location={location}
              navigate={navigate}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              forceOpen={forceOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/* ---------- COLLAPSED RAIL (with hover fly-outs) ---------- */
const CollapsedRail = ({ items, location, navigate }) => {
  return (
    <ul className="space-y-1" role="tree">
      {items.map((mod) => {
        const active = isActive(location, mod.path);
        const hasChildren = Array.isArray(mod.children) && mod.children.length > 0;

        return (
          <li key={mod.path} className="relative group" role="treeitem" aria-current={active ? "page" : undefined}>
            <button
              title={mod.name}
              onClick={() => (!hasChildren ? navigate(mod.path) : null)}
              className={`mx-auto grid h-12 w-12 place-items-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                ${active ? "bg-indigo-700 text-white shadow-inner" : "text-slate-200 hover:bg-indigo-800/70"}
              `}
            >
              {mod.icon}
            </button>

            {hasChildren && (
              <div
                className="invisible absolute left-14 top-0 z-50 w-64 rounded-xl border border-indigo-800/50 bg-gradient-to-b from-indigo-900 via-indigo-950 to-black p-2 opacity-0 shadow-2xl transition-all duration-150 group-hover:visible group-hover:opacity-100"
                role="group"
              >
                <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-indigo-300/80">
                  {mod.name}
                </div>
                <div className="space-y-1">
                  {/* Parent route */}
                  <button
                    onClick={() => navigate(mod.path)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-indigo-800/60 ${
                      active && !mod.children?.some((c) => isActive(location, c.path))
                        ? "bg-indigo-700/60"
                        : ""
                    }`}
                  >
                    {mod.icon}
                    <span>Overview</span>
                  </button>
                  {mod.children.map((child) => {
                    const childActive = isActive(location, child.path);
                    return (
                      <button
                        key={child.path}
                        onClick={() => navigate(child.path)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-indigo-800/60 ${
                          childActive ? "bg-indigo-700/60" : ""
                        }`}
                      >
                        {child.icon}
                        <span className="truncate">{child.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

/* ---------- SIDEBAR ---------- */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  // Restore collapse state
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sidebar:collapsed") || "false");
      setCollapsed(Boolean(saved));
    } catch {
      setCollapsed(false);
    }
  }, []);

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // Auto-open relevant parents for active route (expanded mode)
  useEffect(() => {
    const next = {};
    modules.forEach((mod) => {
      if (location.pathname.startsWith(mod.path)) next[mod.path] = true;
      mod.children?.forEach((child) => {
        if (location.pathname.startsWith(child.path)) {
          next[mod.path] = true;
          next[child.path] = true;
        }
      });
    });
    setOpenMenus(next);
  }, [location.pathname]);

  // Quick focus on search with "/"
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !(e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA" || e.target?.isContentEditable)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleMenu = (path) =>
    setOpenMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));

  // Live filtering (search)
  const filtered = useMemo(() => {
    if (!query.trim()) return modules;
    const q = query.toLowerCase();

    return modules
      .map((mod) => {
        const modMatch = mod.name.toLowerCase().includes(q);
        const kids = (mod.children || []).filter((c) => c.name.toLowerCase().includes(q));
        if (modMatch || kids.length) return { ...mod, children: kids, _forceOpen: true };
        return null;
      })
      .filter(Boolean);
  }, [query]);

  // Split primary vs footer blocks for layout
  const primary = filtered.filter((m) => !["/settingPage", "/logout"].includes(m.path));
  const footer = filtered.filter((m) => ["/settingPage", "/logout"].includes(m.path));

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-72"} sticky top-0 h-screen shrink-0 overflow-y-auto border-r border-indigo-900/40 bg-gradient-to-b from-indigo-950 to-slate-950 p-3 text-white shadow-2xl`}
      aria-label="Primary"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-lg font-semibold tracking-wide">Master</div>
              <div className="leading-none text-[11px] text-indigo-300/70">Control Center</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-lg p-2 text-indigo-200 hover:bg-indigo-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300/60" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…  (press /)"
            className="w-full rounded-lg border border-indigo-800/50 bg-indigo-950/60 py-2 pl-9 pr-8 text-sm placeholder:text-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-300/70 hover:text-indigo-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex h-[calc(100vh-8rem)] flex-col">
        {/* Main */}
        <div className="flex-1 overflow-y-auto pr-1">
          {collapsed ? (
            <CollapsedRail items={primary} navigate={navigate} location={location} />
          ) : (
            <ul className="space-y-1" role="tree">
              {primary.map((mod) => (
                <ExpandedItem
                  key={mod.path}
                  item={mod}
                  location={location}
                  navigate={navigate}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                  forceOpen={mod._forceOpen}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 border-t border-indigo-900/40 pt-3">
          {collapsed ? (
            <CollapsedRail items={footer} navigate={navigate} location={location} />
          ) : (
            <ul className="space-y-1" role="tree">
              {footer.map((mod) => (
                <ExpandedItem
                  key={mod.path}
                  item={mod}
                  location={location}
                  navigate={navigate}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                  forceOpen={mod._forceOpen}
                />
              ))}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
