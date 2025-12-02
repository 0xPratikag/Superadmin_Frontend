import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="flex-1 p-6 bg-slate-950/80 text-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Employees (Attendance)
          </h1>
          <p className="text-sm text-slate-400">
            Employees mapped with machine IDs & branches.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/90 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">EmployeId</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">MachineEmpId</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr
                  key={e._id}
                  className="border-t border-slate-800/60 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-2 font-mono text-xs">
                    {e.EmployeId}
                  </td>
                  <td className="px-4 py-2">{e.name}</td>
                  <td className="px-4 py-2">{e.machineEmpId}</td>
                  <td className="px-4 py-2">
                    {e.branchAdmin?.Branch_name || "-"}
                  </td>
                  <td className="px-4 py-2">{e.role?.name || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        e.isActive
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {e.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <button
                      onClick={() =>
                        navigate(
                          `/monitor/employees/${e._id}/attendance`
                        )
                      }
                      className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                    >
                      View Attendance
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
