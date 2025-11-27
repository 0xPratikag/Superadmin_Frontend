import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, User, ShieldCheck, Mail, Phone, ActivitySquare, Wallet,
  ListChecks, FileText, Receipt, Users, MailPlus, CalendarClock
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Tag = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-200">
    {children}
  </span>
);

export default function AdminDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const axiosAuth = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE,
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token]
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);
  const [full, setFull] = useState(null);
  const [tab, setTab] = useState("profile"); // profile | stats | cases | billings | txns | invoices | subroles | invites | meetings

  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [s, f] = await Promise.all([
        axiosAuth.get(`/admins/${id}/summary`),
        axiosAuth.get(`/admins/${id}/full`),
      ]);
      setSummary(s.data);
      setFull(f.data);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load admin details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </button>
        <div className="text-gray-600">Loading admin details…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
      </div>
    );
  }

  const admin = summary?.admin;
  const stats = full?.stats;
  const rel = full?.related || {};

  return (
    <div className="p-8 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-indigo-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </button>
      </div>

      {/* Hero Card */}
      <div className="rounded-xl border bg-white shadow">
        <div className="flex items-center gap-4 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-indigo-600 text-white">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold">{admin?.Branch_name}</div>
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center gap-1 mr-3">
                <Mail className="h-4 w-4" /> {admin?.branch_email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-4 w-4" /> {admin?.branch_phone || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag>{admin?.role?.name || "role: N/A"}</Tag>
            <Tag>{admin?.isActive ? "Active" : "Inactive"}</Tag>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t bg-gray-50 px-4">
          <div className="flex flex-wrap gap-2 py-3 text-sm">
            {[
              ["profile", <ShieldCheck key="ic" className="h-4 w-4" />, "Profile"],
              ["stats", <ActivitySquare key="is" className="h-4 w-4" />, "Stats"],
              ["cases", <ListChecks key="ca" className="h-4 w-4" />, "Cases"],
              ["billings", <Wallet key="bi" className="h-4 w-4" />, "Billings"],
              ["txns", <FileText key="tx" className="h-4 w-4" />, "Transactions"],
              ["invoices", <Receipt key="in" className="h-4 w-4" />, "Invoices"],
              ["subroles", <Users key="sr" className="h-4 w-4" />, "Sub-roles"],
              ["invites", <MailPlus key="iv" className="h-4 w-4" />, "Invites"],
              ["meetings", <CalendarClock key="mt" className="h-4 w-4" />, "Meetings"],
            ].map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 ${
                  tab === key ? "bg-white text-indigo-700 border border-indigo-200 shadow-sm" : "text-gray-700 hover:bg-white/60"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      {tab === "profile" && (
        <div className="rounded-xl border bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Branch</div>
              <div className="text-gray-800">{admin?.Branch_name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Email</div>
              <div className="text-gray-800">{admin?.branch_email}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Phone</div>
              <div className="text-gray-800">{admin?.branch_phone || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Created At</div>
              <div className="text-gray-800">{new Date(admin?.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Super Admin</div>
              <div className="text-gray-800">{summary?.admin?.superAdminId?.name || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Permissions</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {full?.admin?.role?.permissions?.length
                  ? full.admin.role.permissions.map((p) => <Tag key={p}>{p}</Tag>)
                  : <span className="text-gray-600">No permissions</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="rounded-xl border bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat title="Cases" value={stats?.counts?.cases} />
            <Stat title="Billings" value={stats?.counts?.billings} />
            <Stat title="Transactions" value={stats?.counts?.transactions} />
            <Stat title="Invoices" value={stats?.counts?.invoices} />
            <Stat title="Sub-roles" value={stats?.counts?.subroles} />
            <Stat title="Invites" value={stats?.counts?.invites} />
            <Stat title="Meetings" value={stats?.counts?.meetings} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Money title="Total Billed" value={summary?.money?.totalBilled ?? stats?.money?.totalBilled} />
            <Money title="Total Paid" value={summary?.money?.totalPaid ?? stats?.money?.totalPaid} />
            <Money title="Outstanding" value={summary?.money?.outstanding ?? stats?.money?.outstanding} />
          </div>
        </div>
      )}

      {tab === "cases" && <SimpleTable rows={rel.cases} columns={[
        { k: "_id", h: "Case ID" },
        { k: "patient_name", h: "Patient" },
        { k: "patient_phone", h: "Phone" },
        { k: "case_type", h: "Type" },
        { k: "joining_date", h: "Joined", render: (v)=> v ? new Date(v).toLocaleDateString() : "-" },
      ]} empty="No cases" />}

      {tab === "billings" && <SimpleTable rows={rel.billings} columns={[
        { k: "_id", h: "Billing ID" },
        { k: (r)=> r.caseId?.patient_name, h: "Patient" },
        { k: "_computedTotal", h: "Total", render: (v)=> formatINR(v) },
        { k: "payment_status", h: "Status" },
        { k: "createdAt", h: "Created", render: (v)=> new Date(v).toLocaleString() },
      ]} empty="No billings" />}

      {tab === "txns" && <SimpleTable rows={rel.transactions} columns={[
        { k: "_id", h: "Txn ID" },
        { k: "paymentMode", h: "Mode" },
        { k: "provider", h: "Provider" },
        { k: "amount", h: "Amount", render: (v)=> formatINR(v) },
        { k: "status", h: "Status" },
        { k: "createdAt", h: "Created", render: (v)=> new Date(v).toLocaleString() },
      ]} empty="No transactions" />}

      {tab === "invoices" && <SimpleTable rows={rel.invoices} columns={[
        { k: "invoiceNumber", h: "Invoice No." },
        { k: (r)=> r.caseId?.patient_name, h: "Patient" },
        { k: (r)=> r.transactionId?.amount, h: "Amount", render: (v)=> formatINR(v) },
        { k: "status", h: "Status" },
        { k: "createdAt", h: "Created", render: (v)=> new Date(v).toLocaleString() },
      ]} empty="No invoices" />}

      {tab === "subroles" && <SimpleTable rows={rel.subroles} columns={[
        { k: "name", h: "Name" },
        { k: (r)=> r.permissions?.length, h: "Permissions" },
        { k: (r)=> r.admin_id?.Branch_name, h: "Admin Branch" },
        { k: "createdAt", h: "Created", render: (v)=> new Date(v).toLocaleString() },
      ]} empty="No sub-roles" />}

      {tab === "invites" && <SimpleTable rows={rel.invites} columns={[
        { k: "email", h: "Email" },
        { k: (r)=> r.subroleId?.name, h: "Sub-role" },
        { k: "createdAt", h: "Invited At", render: (v)=> new Date(v).toLocaleString() },
      ]} empty="No invites" />}

      {tab === "meetings" && <SimpleTable rows={rel.meetings} columns={[
        { k: "_id", h: "Meeting ID" },
        { k: "title", h: "Title" },
        { k: "startTime", h: "Starts", render: (v)=> v ? new Date(v).toLocaleString() : "-" },
        { k: "endTime", h: "Ends", render: (v)=> v ? new Date(v).toLocaleString() : "-" },
        { k: (r)=> r.participants?.length, h: "Participants" },
      ]} empty="No meetings" />}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-xs font-semibold uppercase text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800">{value ?? 0}</div>
    </div>
  );
}

function Money({ title, value }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-xs font-semibold uppercase text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800">{formatINR(value ?? 0)}</div>
    </div>
  );
}

function SimpleTable({ rows = [], columns = [], empty = "No data" }) {
  return (
    <div className="rounded-xl border bg-white p-0 shadow overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="px-4 py-2 border-b">{c.h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? rows.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50">
              {columns.map((c, i) => {
                const raw = typeof c.k === "function" ? c.k(r) : r[c.k];
                const val = c.render ? c.render(raw, r) : raw ?? "-";
                return <td key={i} className="px-4 py-2 border-b">{val}</td>;
              })}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatINR(n) {
  const num = Number(n || 0);
  return num.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}
