import React from "react";
import {
  BarChart3,
  Users2,
  Building2,
  CreditCard,
  Activity,
} from "lucide-react";

const statCards = [
  {
    title: "Total Admins",
    value: "24",
    icon: <Users2 className="text-white" size={28} />,
    color: "bg-indigo-500",
  },
  {
    title: "Total Users",
    value: "1,582",
    icon: <Users2 className="text-white" size={28} />,
    color: "bg-green-500",
  },
  {
    title: "Branches",
    value: "12",
    icon: <Building2 className="text-white" size={28} />,
    color: "bg-yellow-500",
  },
  {
    title: "Revenue",
    value: "₹1,20,500",
    icon: <CreditCard className="text-white" size={28} />,
    color: "bg-pink-500",
  },
];

const recentActivities = [
  { id: 1, text: "Abhishek created a new branch - Bank More", time: "2 hrs ago" },
  { id: 2, text: "Riya updated role permissions", time: "5 hrs ago" },
  { id: 3, text: "New admin added for Dhanbad", time: "1 day ago" },
  { id: 4, text: "Password reset by Raj", time: "2 days ago" },
];

const DashboardBase = () => {
  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700">📊 Master Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-xl shadow-md p-5 text-white flex justify-between items-center ${card.color}`}
          >
            <div>
              <h4 className="text-lg font-semibold">{card.title}</h4>
              <p className="text-2xl mt-1 font-bold">{card.value}</p>
            </div>
            <div className="opacity-80">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <BarChart3 className="text-indigo-500" /> Branch Performance
            </h3>
            <span className="text-sm text-gray-500">Aug 2025</span>
          </div>
          <div className="h-48 flex items-center justify-center text-gray-400">
            {/* Replace with Chart.js or Recharts */}
            [Bar Chart Placeholder]
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">User Distribution</h3>
          <div className="h-48 flex items-center justify-center text-gray-400">
            {/* Replace with Pie chart */}
            [Pie Chart Placeholder]
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow-md rounded-lg p-5">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Activity className="text-green-600" /> Recent Activities
        </h3>
        <ul className="space-y-3 text-gray-600 text-sm">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="border-b pb-2">
              <p>{activity.text}</p>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardBase;
