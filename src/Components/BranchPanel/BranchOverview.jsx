import React from "react";
import { useParams } from "react-router-dom";
import {
  CalendarClock,
  Users,
  UserCheck2,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const visitsData = [
  { day: "Mon", visits: 24 },
  { day: "Tue", visits: 30 },
  { day: "Wed", visits: 28 },
  { day: "Thu", visits: 35 },
  { day: "Fri", visits: 40 },
  { day: "Sat", visits: 32 },
  { day: "Sun", visits: 18 },
];

const upcomingAppointments = [
  {
    id: 1,
    patient: "Rohan Sharma",
    therapist: "Dr. Mehta",
    time: "10:30 AM",
    type: "Therapy Session",
  },
  {
    id: 2,
    patient: "Ananya Verma",
    therapist: "Dr. Singh",
    time: "11:15 AM",
    type: "Follow-up",
  },
  {
    id: 3,
    patient: "Vikram Rao",
    therapist: "Dr. Ali",
    time: "12:00 PM",
    type: "First Visit",
  },
];

const BranchOverview = () => {
  const { branchId } = useParams();

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* top bar / breadcrumb */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Branch Dashboard
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Clinic Overview
            </h1>
            <p className="text-xs text-slate-500">
              Branch ID: <span className="font-mono">{branchId}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:bg-slate-50">
              Today: <span className="font-semibold">Mon, 08 Jan</span>
            </button>
            <button className="rounded-full bg-indigo-600 px-4 py-1.5 font-semibold text-white shadow-md shadow-indigo-300/40 hover:bg-indigo-700">
              Switch Day View
            </button>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="mx-auto max-w-6xl space-y-5 px-4 pb-6 pt-5">
        {/* metric cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Today’s Appointments",
              value: "18",
              sub: "+4 vs yesterday",
              icon: <CalendarClock className="h-4 w-4" />,
              chip: "Live",
              chipColor: "bg-emerald-50 text-emerald-600",
            },
            {
              title: "Active Patients",
              value: "126",
              sub: "32 in follow-up",
              icon: <Users className="h-4 w-4" />,
              chip: "This branch",
              chipColor: "bg-sky-50 text-sky-600",
            },
            {
              title: "Therapists On Duty",
              value: "5",
              sub: "2 remote, 3 onsite",
              icon: <UserCheck2 className="h-4 w-4" />,
              chip: "Roster",
              chipColor: "bg-indigo-50 text-indigo-600",
            },
            {
              title: "Utilization",
              value: "82%",
              sub: "Targets look healthy",
              icon: <Activity className="h-4 w-4" />,
              chip: "This week",
              chipColor: "bg-violet-50 text-violet-600",
            },
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900/5 text-slate-700">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      {card.title}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${card.chipColor}`}
                >
                  {card.chip}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {card.value}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Weekly Visits
                </p>
                <p className="text-[11px] text-slate-500">
                  Number of completed sessions this week
                </p>
              </div>
              <button className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100">
                Last 7 days
              </button>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitsData}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisits)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* upcoming appointments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Upcoming Appointments
                </p>
                <p className="text-[11px] text-slate-500">
                  Next sessions scheduled for today
                </p>
              </div>
              <button className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100">
                View all
              </button>
            </div>

            <ul className="divide-y divide-slate-100 text-sm">
              {upcomingAppointments.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-[13px] font-semibold text-indigo-700">
                      {item.patient[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.patient}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.type} · with {item.therapist}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600">
                      {item.time}
                    </span>
                    <button className="rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BranchOverview;
