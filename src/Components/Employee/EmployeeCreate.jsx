// src/pages/Employee/EmployeeCreate.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  UserPlus2,
  Mail,
  Lock,
  Building2,
  MapPin,
  Hash,
  Shield,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Select from "react-select";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ✅ Validation schema
const EmployeeCreateSchema = z.object({
  EmployeId: z
    .string()
    .min(3, "Employee ID must be at least 3 characters")
    .max(120, "Employee ID is too long"),

  name: z.string().min(3, "Name must be at least 3 characters").max(120, "Name is too long"),

  email: z.string().email("Please enter a valid email address"),

  // Optional password
  password: z.string().max(64, "Password is too long").optional().or(z.literal("")),

  branchAccessPassword: z
    .string()
    .max(64, "Branch access password is too long")
    .optional()
    .or(z.literal("")),

  location: z.string().max(120, "Location is too long").optional().or(z.literal("")),

  // Stored as string in the form input, converted to number on submit
  machineEmpId: z
    .string()
    .min(1, "Machine Employee ID is required")
    .regex(/^\d+$/, "Machine Employee ID must be a number"),

  branch: z.string().min(1, "Branch is required"),
  role: z.string().min(1, "Role / designation is required"),
  isActive: z.boolean().default(true),
});

export default function EmployeeCreate() {
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isFetchingNextId, setIsFetchingNextId] = useState(false);

  const token = localStorage.getItem("token");

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [token]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(EmployeeCreateSchema),
    defaultValues: {
      EmployeId: "",
      name: "",
      email: "",
      password: "",
      branchAccessPassword: "",
      location: "",
      machineEmpId: "",
      role: "",
      branch: "",
      isActive: true,
    },
  });

  const selectedBranchId = watch("branch");

  const fetchBranches = async () => {
    try {
      const res = await axiosAuth.get("/getAllBranches");
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load branches.");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axiosAuth.get("/get-roles");
      const data = res.data?.data || res.data || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load roles.");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch next EmployeeId & MachineEmpId when a branch is selected
  const fetchNextIdForBranch = async (branchId) => {
    if (!branchId) return;

    setIsFetchingNextId(true);
    try {
      // Expected final URL:
      // https://server.indiatherapycentre.com/api/superadmin/employees/next-id/:branchId
      // If API_BASE is ".../api/superadmin", then this becomes:
      // `${API_BASE}/employees/next-id/${branchId}`
      const res = await axiosAuth.get(`/employees/next-id/${branchId}`);
      const next = res.data?.data;

      if (!next?.nextEmployeeId || next?.nextMachineEmpId == null) {
        throw new Error("Invalid response from next-id API.");
      }

      setValue("EmployeId", String(next.nextEmployeeId).toUpperCase(), { shouldValidate: true });
      setValue("machineEmpId", String(next.nextMachineEmpId), { shouldValidate: true });

      toast.success("Employee ID generated for the selected branch.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to generate Employee ID.");
      // Clear fields if API fails
      setValue("EmployeId", "", { shouldValidate: true });
      setValue("machineEmpId", "", { shouldValidate: true });
    } finally {
      setIsFetchingNextId(false);
    }
  };

  useEffect(() => {
    if (!selectedBranchId) {
      setValue("EmployeId", "", { shouldValidate: true });
      setValue("machineEmpId", "", { shouldValidate: true });
      return;
    }
    fetchNextIdForBranch(selectedBranchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        EmployeId: values.EmployeId.toUpperCase().trim(),
        name: values.name.trim(),
        email: values.email.trim(),
        location: values.location || undefined,
        machineEmpId: Number(values.machineEmpId), // ✅ convert to number
        role: values.role || undefined,
        branch: values.branch || undefined,
        isActive: values.isActive,

        // UI field -> backend supports both keys
        branchAcesspassword: values.branchAccessPassword || undefined,
        branch_Access_password: values.branchAccessPassword || undefined,
      };

      // Only send password if provided
      if (values.password) payload.password = values.password;

      await axiosAuth.post("/createEmployee", payload);
      toast.success("Employee created successfully.");
      reset();
      window.location.href = "/employee/list";
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create employee.");
    }
  };

  const inputBase =
    "w-full rounded-lg border px-3 py-2.5 bg-slate-50 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 " +
    "placeholder:text-slate-400";

  const labelBase = "flex items-center gap-1 text-xs font-medium text-slate-700 mb-1";

  const errorText = (msg) => (msg ? <p className="mt-1 text-xs text-rose-500">{msg}</p> : null);

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: b.Branch_name || b.name || "Unnamed branch",
  }));

  const roleOptions = roles.map((r) => ({
    value: r._id,
    label: r.name,
    meta: r.designation,
  }));

  return (
    <div className="w-full min-h-screen bg-slate-50/80 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-300/40">
              <UserPlus2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Employee</h1>
              <p className="text-sm text-slate-500">
                Assign role, branch, and attendance mapping in one step.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-2xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-200/70"
        >
          <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Employee Setup
              </p>
              <p className="text-sm text-slate-500">
                Enter employee details and automatically generate biometric IDs based on branch.
              </p>
            </div>

            <span className="inline-flex h-7 items-center rounded-full bg-emerald-50 px-3 text-[11px] font-medium text-emerald-700 border border-emerald-100">
              Auto-map to attendance & roles
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 pt-5 space-y-6 text-sm">
            {/* Row: Branch + Role */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  Branch <span className="text-rose-500">*</span>
                </label>

                <Controller
                  control={control}
                  name="branch"
                  render={({ field }) => (
                    <Select
                      options={branchOptions}
                      value={field.value ? branchOptions.find((opt) => opt.value === field.value) : null}
                      onChange={(opt) => field.onChange(opt?.value || "")}
                      classNamePrefix="react-select"
                      placeholder="Select branch"
                      isClearable={false}
                    />
                  )}
                />

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-400">
                    Selecting a branch generates the next Employee ID automatically.
                  </p>

                  <button
                    type="button"
                    onClick={() => fetchNextIdForBranch(selectedBranchId)}
                    disabled={!selectedBranchId || isFetchingNextId}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    title="Regenerate ID"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingNextId ? "animate-spin" : ""}`} />
                    {isFetchingNextId ? "Generating..." : "Regenerate"}
                  </button>
                </div>

                {errorText(errors.branch?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <Shield className="h-3.5 w-3.5 text-indigo-500" />
                  Role / Designation <span className="text-rose-500">*</span>
                </label>

                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      options={roleOptions}
                      value={field.value ? roleOptions.find((opt) => opt.value === field.value) : null}
                      onChange={(opt) => field.onChange(opt?.value || "")}
                      classNamePrefix="react-select"
                      placeholder="Select role"
                      isClearable={false}
                    />
                  )}
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Roles are loaded from the <code>get-roles</code> endpoint.
                </p>

                {errorText(errors.role?.message)}
              </div>
            </div>

            {/* Row: Employee ID + Name */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Hash className="h-3.5 w-3.5 text-indigo-500" />
                  Employee ID <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="EMPJN1001"
                  className={`${inputBase} bg-slate-100`}
                  {...register("EmployeId")}
                  readOnly
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  This value is generated automatically and stored in uppercase.
                </p>

                {errorText(errors.EmployeId?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <UserPlus2 className="h-3.5 w-3.5 text-indigo-500" />
                  Full Name <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Employee full name"
                  className={inputBase}
                  {...register("name")}
                />

                {errorText(errors.name?.message)}
              </div>
            </div>

            {/* Row: Email + Password */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Mail className="h-3.5 w-3.5 text-indigo-500" />
                  Email <span className="text-rose-500">*</span>
                </label>

                <input
                  type="email"
                  placeholder="employee@example.com"
                  className={inputBase}
                  {...register("email")}
                />

                {errorText(errors.email?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <Lock className="h-3.5 w-3.5 text-indigo-500" />
                  Login Password{" "}
                  <span className="ml-1 text-[10px] font-normal text-slate-400">(optional)</span>
                </label>

                <input
                  type="password"
                  placeholder="Secure password (optional)"
                  className={inputBase}
                  {...register("password")}
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  If left blank, the backend will not set a password.
                </p>

                {errorText(errors.password?.message)}
              </div>
            </div>

            {/* Row: Machine ID + Location */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Shield className="h-3.5 w-3.5 text-indigo-500" />
                  Machine Employee ID <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="1001"
                  className={`${inputBase} bg-slate-100`}
                  {...register("machineEmpId")}
                  readOnly
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  This ID is used for biometric/attendance devices (IDMS).
                </p>

                {errorText(errors.machineEmpId?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  Location{" "}
                  <span className="ml-1 text-[10px] font-normal text-slate-400">(optional)</span>
                </label>

                <input
                  type="text"
                  placeholder="Dhanbad, Jharkhand"
                  className={inputBase}
                  {...register("location")}
                />

                {errorText(errors.location?.message)}
              </div>
            </div>

            {/* Row: Branch Access Password + Status */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Lock className="h-3.5 w-3.5 text-indigo-500" />
                  Branch Access Password{" "}
                  <span className="ml-1 text-[10px] font-normal text-slate-400">(optional)</span>
                </label>

                <input
                  type="text"
                  placeholder="Special access password (if any)"
                  className={inputBase}
                  {...register("branchAccessPassword")}
                />

                {errorText(errors.branchAccessPassword?.message)}
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  {...register("isActive")}
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
                  Mark employee as active
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear Form
              </button>

              <motion.button
                type="submit"
                disabled={isSubmitting || isFetchingNextId}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-300/40 hover:bg-indigo-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Employee"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
