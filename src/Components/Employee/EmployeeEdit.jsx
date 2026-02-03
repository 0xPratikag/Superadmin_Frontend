// src/pages/Employee/EmployeeEdit.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  UserCircle2,
  Mail,
  Lock,
  Building2,
  MapPin,
  Hash,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Select from "react-select";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 🔐 Same philosophy as Create page
const EmployeeEditSchema = z.object({
  EmployeId: z
    .string()
    .min(3, "Employee ID must be at least 3 characters")
    .max(120, "Employee ID too long"),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(120, "Name too long"),
  email: z.string().email("Please enter a valid email address"),
  // Password OPTIONAL – only send if provided
  password: z
    .string()
    .max(64, "Password too long")
    .optional()
    .or(z.literal("")),
  branchAccessPassword: z
    .string()
    .max(64, "Branch access password too long")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(120, "Location too long")
    .optional()
    .or(z.literal("")),
  // MachineEmpId == EmployeId (string), auto-sync, readOnly in UI
  machineEmpId: z.string().min(1, "Machine Employee ID required"),
  // Branch required (same as Create)
  branch: z.string().min(1, "Branch is required"),
  // Role required (same as Create)
  role: z.string().min(1, "Role / designation is required"),
  isActive: z.boolean().default(true),
});

export default function EmployeeEdit() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(EmployeeEditSchema),
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

  // 👀 EmployeeId ko watch karke MachineEmpId auto-sync (same as Create)
  const watchedEmployeeId = watch("EmployeId");

  useEffect(() => {
    if (!watchedEmployeeId) {
      setValue("machineEmpId", "", { shouldValidate: true });
      return;
    }
    setValue("machineEmpId", String(watchedEmployeeId), {
      shouldValidate: true,
    });
  }, [watchedEmployeeId, setValue]);

  const fetchBranches = async () => {
    try {
      const res = await axiosAuth.get("/getAllBranches");
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load branches");
    }
  };

  const fetchRoles = async () => {
    try {
      // 🔁 Same endpoint as Create page
      const res = await axiosAuth.get("/get-roles");
      const data = res.data?.data || res.data || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load roles");
    }
  };

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get(`/getEmployeeById/${id}`);
      const raw = res.data?.data || res.data?.employee || res.data || {};

      const empId = raw.EmployeId || "";
      const machine =
        raw.machineEmpId !== undefined && raw.machineEmpId !== null
          ? String(raw.machineEmpId)
          : empId;

      reset({
        EmployeId: empId,
        name: raw.name || "",
        email: raw.email || "",
        password: "",
        branchAccessPassword:
          raw.branchAcesspassword ||
          raw.branch_Access_password ||
          "",
        location: raw.location || "",
        // initially set from backend, but watch(EmployeId) effect will sync
        machineEmpId: machine,
        role: raw.role?._id || "",
        branch: raw.branch?._id || "",
        isActive: raw.isActive ?? true,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchRoles();
    fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        EmployeId: values.EmployeId.toUpperCase().trim(),
        name: values.name.trim(),
        email: values.email.trim(),
        location: values.location || undefined,
        // 👇 MachineEmpId ko string hi bhej rahe (Create page ke saath consistent)
        machineEmpId: values.machineEmpId,
        role: values.role || undefined,
        branch: values.branch || undefined,
        isActive: values.isActive,
        branchAcesspassword: values.branchAccessPassword || undefined,
        branch_Access_password: values.branchAccessPassword || undefined,
      };

      // Password sirf tab bhejna jab user ne naya password diya ho
      if (values.password) {
        payload.password = values.password;
      }

      await axiosAuth.put(`/updateEmployee/${id}`, payload);
      toast.success("Employee updated successfully");
      window.location.href = "/employee/list";
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const inputBase =
    "w-full rounded-lg border px-3 py-2.5 bg-slate-50 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 " +
    "placeholder:text-slate-400";

  const labelBase =
    "flex items-center gap-1 text-xs font-medium text-slate-700 mb-1";

  const errorText = (msg) =>
    msg ? <p className="mt-1 text-xs text-rose-500">{msg}</p> : null;

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: b.Branch_name || b.name || "Unnamed branch",
  }));

  const roleOptions = roles.map((r) => ({
    value: r._id,
    label: r.name,
    meta: r.designation,
  }));

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/80 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading employee details…
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/80 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-300/40">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Employee
              </h1>
              <p className="text-sm text-slate-500">
                Update employee details, mapping and optionally reset password.
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
                Employee Details
              </p>
              <p className="text-sm text-slate-500">
                Changes are applied instantly after save.
              </p>
            </div>
            <span className="inline-flex h-7 items-center rounded-full bg-slate-50 px-3 text-[11px] font-medium text-slate-600 border border-slate-200">
              Keeps biometric mapping in sync
            </span>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 pt-5 space-y-6 text-sm"
          >
            {/* Row: ID + Name */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Hash className="h-3.5 w-3.5 text-indigo-500" />
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                disabled
                  type="text"
                  className={inputBase}
                  {...register("EmployeId")}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Isko change karoge to Machine Employee ID bhi same ho jayega.
                </p>
                {errorText(errors.EmployeId?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <UserCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                         disabled
                  type="text"
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
                  className={inputBase}
                  {...register("email")}
                />
                {errorText(errors.email?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <Lock className="h-3.5 w-3.5 text-indigo-500" />
                  Login Password
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    (leave blank to keep existing)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputBase} pr-9`}
                    {...register("password")}
                    placeholder="New password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Strong password use karein; sirf tab change hoga jab aap yaha
                  naya password daalenge.
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
                  className={`${inputBase} bg-slate-100`}
                  {...register("machineEmpId")}
                  readOnly
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Employee ID ke saath auto-sync rahega. Biometric / IDMS me yehi
                  use hota hai.
                </p>
                {errorText(errors.machineEmpId?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  Location
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  className={inputBase}
                  {...register("location")}
                />
                {errorText(errors.location?.message)}
              </div>
            </div>

            {/* Row: Branch + Role (both required like Create) */}
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
                             disabled
                      // options={branchOptions}
                      value={
                        field.value
                          ? branchOptions.find(
                              (opt) => opt.value === field.value
                            )
                          : null
                      }
                      // onChange={(opt) => field.onChange(opt?.value || "")}
                      classNamePrefix="react-select"
                      placeholder="Select branch"
                      isClearable={false}
                    />
                  )}
                />
                not editable
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
                      value={
                        field.value
                          ? roleOptions.find(
                              (opt) => opt.value === field.value
                            )
                          : null
                      }
                      onChange={(opt) => field.onChange(opt?.value || "")}
                      classNamePrefix="react-select"
                      placeholder="Select role (designation)"
                      isClearable={false}
                    />
                  )}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  List <code>get-roles</code> endpoint se aa rahi hai. Role name
                  ka mapping designation se hi hai.
                </p>
                {errorText(errors.role?.message)}
              </div>
            </div>

            {/* Row: Branch Access Password + Status */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Lock className="h-3.5 w-3.5 text-indigo-500" />
                  Branch Access Password
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
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
                <label
                  htmlFor="isActive"
                  className="text-xs font-medium text-slate-700"
                >
                  Employee is active
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={fetchEmployee}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset to current
              </button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-300/40 hover:bg-indigo-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? "Saving changes…" : "Save Changes"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
