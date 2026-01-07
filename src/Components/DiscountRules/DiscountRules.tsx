import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Percent,
  BadgePercent,
  Layers,
  LayoutGrid,
  List,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* -------------------------------------------------------------------------
   Axios instance (independent)
---------------------------------------------------------------------------*/
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// attach token each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If your backend routes are mounted under /super-admin, set:
// VITE_SUPERADMIN_PREFIX=/super-admin
// Otherwise leave empty.
const PREFIX = import.meta.env.VITE_SUPERADMIN_PREFIX || "";

/* -------------------------------------------------------------------------
   Tiny UI primitives (independent)
---------------------------------------------------------------------------*/
function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
        active
          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
          : "bg-gray-400 text-white shadow-sm shadow-gray-200"
      }`}
    >
      {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Card({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 ${
        hover ? "hover:shadow-lg hover:border-gray-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  icon,
}: {
  label?: string;
  value: any;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        )}
        <input
          type={type}
          value={value ?? ""}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border-2 border-gray-200 bg-gray-50 ${
            icon ? "pl-10 pr-4" : "px-4"
          } py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200`}
        />
      </div>
    </div>
  );
}

function NumberInput(props: any) {
  return <Input {...props} type="number" />;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div
        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
          checked ? "bg-emerald-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {checked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        </span>
      </div>
      {label && <span className="text-sm font-semibold text-gray-700">{label}</span>}
    </button>
  );
}

function Button({
  onClick,
  children,
  variant = "primary",
  className = "",
  icon,
  size = "md",
  type = "button",
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "secondary" | "outline";
  className?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants: any = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 hover:shadow-lg",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 hover:shadow-lg",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 hover:shadow-lg",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-sm",
    outline:
      "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300",
  };

  const sizes: any = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant]
      } ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------
   Types + Helpers
---------------------------------------------------------------------------*/
type DiscountRule = {
  _id: string;
  minSessions: number;
  maxSessions: number;
  discount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
}

/* -------------------------------------------------------------------------
   Component
---------------------------------------------------------------------------*/
export default function DiscountRules() {
  const [items, setItems] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    minSessions: "",
    maxSessions: "",
    discount: "",
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);

  const endpoints = {
    list: `${PREFIX}/discount-rules`,
    one: (id: string) => `${PREFIX}/discount-rules/${id}`,
    toggle: (id: string) => `${PREFIX}/discount-rules/${id}/toggle`,
  };

  const fetchRules = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoints.list, { signal });
      setItems(res.data?.rules || []);
    } catch (e: any) {
      if (e?.name !== "CanceledError") {
        console.error(e);
        setError(e?.response?.data?.message || "Failed to load discount rules");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctl = new AbortController();
    fetchRules(ctl.signal);
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ minSessions: "", maxSessions: "", discount: "", isActive: true });
    setError(null);
  };

  const startEdit = (it: DiscountRule) => {
    setEditingId(it._id);
    setForm({
      minSessions: String(it.minSessions ?? ""),
      maxSessions: String(it.maxSessions ?? ""),
      discount: String(it.discount ?? ""),
      isActive: !!it.isActive,
    });
    setError(null);
  };

  const filteredItems = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const sorted = [...items].sort((a, b) => a.minSessions - b.minSessions);

    if (!qq) return sorted;

    return sorted.filter((it) => {
      const hay = `${it.minSessions}-${it.maxSessions} ${it.discount} ${it.isActive ? "active" : "inactive"}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [items, q]);

  const validateClient = () => {
    const minSessions = Number(form.minSessions);
    const maxSessions = Number(form.maxSessions);
    const discount = Number(form.discount);

    if (!Number.isFinite(minSessions) || minSessions < 1) return "Min sessions must be >= 1";
    if (!Number.isFinite(maxSessions) || maxSessions < 1) return "Max sessions must be >= 1";
    if (minSessions > maxSessions) return "Min sessions cannot be greater than Max sessions";
    if (!Number.isFinite(discount) || discount < 0) return "Discount must be >= 0";
    return null;
  };

  const createRule = async () => {
    setError(null);
    const msg = validateClient();
    if (msg) return setError(msg);

    try {
      await api.post(endpoints.list, {
        minSessions: Number(form.minSessions),
        maxSessions: Number(form.maxSessions),
        discount: Number(form.discount),
        isActive: !!form.isActive,
      });
      resetForm();
      fetchRules();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to create rule");
    }
  };

  const updateRule = async () => {
    if (!editingId) return;
    setError(null);

    const msg = validateClient();
    if (msg) return setError(msg);

    try {
      await api.patch(endpoints.one(editingId), {
        minSessions: Number(form.minSessions),
        maxSessions: Number(form.maxSessions),
        discount: Number(form.discount),
        isActive: !!form.isActive,
      });
      resetForm();
      fetchRules();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update rule");
    }
  };

  const toggleActive = async (id: string) => {
    // optimistic
    setItems((prev) =>
      prev.map((x) => (x._id === id ? { ...x, isActive: !x.isActive } : x))
    );

    try {
      await api.patch(endpoints.toggle(id));
    } catch (e) {
      console.error(e);
      fetchRules(); // rollback
    }
  };

  const deleteRule = async (id: string) => {
    if (!window.confirm("Delete this discount rule?")) return;
    setError(null);

    try {
      await api.delete(endpoints.one(id));
      if (editingId === id) resetForm();
      fetchRules();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to delete rule");
    }
  };

  const HeaderIcon = BadgePercent || Percent;

  return (
    <div className="w-full min-h-screen bg-slate-50/80 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 rounded-3xl border border-gray-200 shadow-xl" hover={false}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <HeaderIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Discount Rules</h1>
                <p className="text-gray-600 font-medium">
                  Define session ranges and discounts (e.g. 12–19 → 10%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => fetchRules()}
              >
                Refresh
              </Button>

              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Search */}
        <Card className="p-4 border border-gray-200 shadow-lg" hover={false}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 flex-1 w-full">
              <Input
                value={q}
                onChange={setQ}
                placeholder="Search (e.g. 12-19, 10, active)..."
                icon={<Search className="w-4 h-4" />}
              />
              <div className="hidden md:block text-sm font-semibold text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Total: {items.length}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 border border-gray-200 shadow-lg" hover={false}>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? "Edit Discount Rule" : "Create Discount Rule"}
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-xl border-2 border-rose-200 bg-rose-50 text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div className="text-sm font-semibold">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <NumberInput
              label="Min Sessions"
              value={form.minSessions}
              onChange={(v) => setForm((f) => ({ ...f, minSessions: v }))}
              min={1}
              placeholder="12"
            />

            <NumberInput
              label="Max Sessions"
              value={form.maxSessions}
              onChange={(v) => setForm((f) => ({ ...f, maxSessions: v }))}
              min={1}
              placeholder="19"
            />

            <NumberInput
              label="Discount (%)"
              value={form.discount}
              onChange={(v) => setForm((f) => ({ ...f, discount: v }))}
              min={0}
              placeholder="10"
              icon={<Percent className="w-4 h-4" />}
            />

            <div className="flex items-end">
              <Toggle
                checked={form.isActive}
                onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                label="Active"
              />
            </div>

            <div className="flex items-end gap-3">
              {editingId ? (
                <>
                  <Button onClick={updateRule} variant="primary" className="flex-1">
                    Update
                  </Button>
                  <Button onClick={resetForm} variant="secondary">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={createRule}
                  variant="success"
                  className="flex-1"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Tip: Keep ranges non-overlapping. Example: 12–19, 20–22, 23–30…
          </div>
        </Card>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20" aria-busy>
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 font-semibold">Loading discount rules...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 border border-gray-200 shadow-lg" hover={false}>
            <div className="flex flex-col items-center gap-4" aria-live="polite">
              <HeaderIcon className="w-16 h-16 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-800">No Discount Rules</h3>
              <p className="text-gray-600">Create your first rule to get started.</p>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((it) => (
              <Card
                key={it._id}
                className={`p-5 cursor-default ${
                  editingId === it._id ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <HeaderIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-lg">
                        {it.minSessions}–{it.maxSessions} sessions
                      </div>
                      <div className="text-sm font-bold text-blue-700">{it.discount}% discount</div>
                    </div>
                  </div>
                  <Badge active={!!it.isActive} />
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div>Created: {fmtDate(it.createdAt)}</div>
                  <div>Updated: {fmtDate(it.updatedAt)}</div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => toggleActive(it._id)} variant="secondary" size="sm">
                    Toggle
                  </Button>
                  <Button
                    onClick={() => startEdit(it)}
                    variant="outline"
                    size="sm"
                    icon={<Pencil className="w-3 h-3" />}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => deleteRule(it._id)}
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-3 h-3" />}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card hover={false} className="border border-gray-200 shadow-lg">
            <div className="divide-y divide-gray-100">
              {filteredItems.map((it) => (
                <div key={it._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <HeaderIcon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="font-black text-gray-900">
                          {it.minSessions}–{it.maxSessions} sessions
                        </div>
                        <div className="text-sm font-bold text-blue-700">{it.discount}% discount</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {fmtDate(it.createdAt)} • Updated: {fmtDate(it.updatedAt)}
                        </div>
                      </div>

                      <Badge active={!!it.isActive} />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button onClick={() => toggleActive(it._id)} variant="secondary" size="sm">
                        Toggle
                      </Button>
                      <Button
                        onClick={() => startEdit(it)}
                        variant="outline"
                        size="sm"
                        icon={<Pencil className="w-3 h-3" />}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteRule(it._id)}
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-3 h-3" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
