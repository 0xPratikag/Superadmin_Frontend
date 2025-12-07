import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  Lock,
  Cloud,
  Network,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ✅ Validation schema
const BranchEditSchema = z.object({
  Branch_name: z
    .string()
    .min(3, "Branch name must be at least 3 characters")
    .max(80, "Branch name too long"),
  branch_email: z.string().email("Please enter a valid email address"),
  branch_password: z
    .string()
    .max(64, "Password too long")
    .optional()
    .or(z.literal("")), // empty = don't change
  branch_phone: z
    .string()
    .max(20, "Phone number too long")
    .optional()
    .or(z.literal("")),
  branch_ip: z
    .string()
    .max(50, "IP too long")
    .optional()
    .or(z.literal("")),
  branch_cloudId: z
    .string()
    .max(100, "Cloud ID too long")
    .optional()
    .or(z.literal("")),
});

export default function BranchEdit() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(BranchEditSchema),
    defaultValues: {
      Branch_name: "",
      branch_email: "",
      branch_password: "",
      branch_phone: "",
      branch_ip: "",
      branch_cloudId: "",
    },
  });

  const fetchBranch = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get(`/getBranchById/${id}`);
      const data = res.data || res.data?.data || res.data?.branch || res.data;

      reset({
        Branch_name: data.Branch_name || "",
        branch_email: data.branch_email || "",
        branch_password: "", // ❗ don't show hashed password
        branch_phone: data.branch_phone || "",
        branch_ip: data.branch_ip || "",
        branch_cloudId: data.branch_cloudId || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load branch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values) => {
    try {
      const payload = { ...values };

      // If password left blank, don't send it (so backend won't update it)
      if (!payload.branch_password) {
        delete payload.branch_password;
      }

      await axiosAuth.put(`/updateBranch/${id}`, payload);
      toast.success("Branch updated successfully");
      window.location.href = "/branch/list";
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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/80 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading branch details…
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
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Branch
              </h1>
              <p className="text-sm text-slate-500">
                Update branch information and credentials.
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
          {/* Top bar / status */}
          <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Branch Details
              </p>
              <p className="text-sm text-slate-500">
                Edit the branch contact, metadata and optionally reset password.
              </p>
            </div>
            <span className="inline-flex h-7 items-center rounded-full bg-slate-50 px-3 text-[11px] font-medium text-slate-600 border border-slate-200">
              Changes are applied instantly after save
            </span>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 pt-5 space-y-6 text-sm"
          >
            {/* Basic info row */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai HQ"
                  className={inputBase}
                  {...register("Branch_name")}
                />
                {errorText(errors.Branch_name?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <Mail className="h-3.5 w-3.5 text-indigo-500" />
                  Branch Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="branch@example.com"
                  className={inputBase}
                  {...register("branch_email")}
                />
                {errorText(errors.branch_email?.message)}
              </div>
            </div>

            {/* Credentials row */}
            <div className="grid gap-4 md:grid-cols-2">
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
                    placeholder="New password (optional)"
                    className={`${inputBase} pr-9`}
                    {...register("branch_password")}
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
                  Use a strong password and share it securely with the branch
                  admin.
                </p>
                {errorText(errors.branch_password?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <Phone className="h-3.5 w-3.5 text-indigo-500" />
                  Contact Phone
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={inputBase}
                  {...register("branch_phone")}
                />
                {errorText(errors.branch_phone?.message)}
              </div>
            </div>

            {/* Meta row */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelBase}>
                  <Network className="h-3.5 w-3.5 text-indigo-500" />
                  Branch IP
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.10"
                  className={inputBase}
                  {...register("branch_ip")}
                />
                {errorText(errors.branch_ip?.message)}
              </div>

              <div>
                <label className={labelBase}>
                  <Cloud className="h-3.5 w-3.5 text-indigo-500" />
                  Cloud / Device ID
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Cloud reference or biometric device ID"
                  className={inputBase}
                  {...register("branch_cloudId")}
                />
                {errorText(errors.branch_cloudId?.message)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={fetchBranch}
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
