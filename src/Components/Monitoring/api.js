import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function getAuthClient() {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchAttendanceBranches() {
  const api = getAuthClient();
  const res = await api.get("/attendance/branches");
  return res.data;
}

export async function fetchBranchAttendance(params) {
  const api = getAuthClient();
  const res = await api.get("/attendance", { params });
  return res.data;
}

export async function fetchAttendanceLogs(id) {
  const api = getAuthClient();
  const res = await api.get(`/attendance/${id}/logs`);
  return res.data;
}

export async function updateApproval(id, body) {
  const api = getAuthClient();
  const res = await api.patch(`/attendance/${id}/approval`, body);
  return res.data;
}
