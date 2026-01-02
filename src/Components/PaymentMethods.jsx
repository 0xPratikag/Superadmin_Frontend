// src/Components/PaymentMethods/PaymentMethods.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

const PaymentMethods = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    upiId: "",
    upiName: "",
    upiMerchantCode: "",
    upiNote: "",
    showOnInvoice: true,
    showOnReceipt: true,
    enableUpiQr: true,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/payment-methods`, {
        headers: authHeader,
      });
      setBankDetails((prev) => ({
        ...prev,
        ...(res.data?.bankDetails || {}),
      }));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBankDetails((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${baseURL}/payment-methods`,
        { bankDetails },
        { headers: authHeader }
      );
      alert("✅ Payment methods saved");
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const upiQrValue = useMemo(() => {
    const upiId = (bankDetails.upiId || "").trim();
    if (!upiId) return "";
    const pn = encodeURIComponent(bankDetails.upiName || "Clinic");
    const pa = encodeURIComponent(upiId);
    const cu = "INR";
    const tn = bankDetails.upiNote ? `&tn=${encodeURIComponent(bankDetails.upiNote)}` : "";
    const mc = bankDetails.upiMerchantCode
      ? `&mc=${encodeURIComponent(bankDetails.upiMerchantCode)}`
      : "";
    return `upi://pay?pa=${pa}&pn=${pn}&cu=${cu}${tn}${mc}`;
  }, [bankDetails]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h2 className="text-2xl font-extrabold">💳 Payment Methods</h2>
          <p className="text-sm opacity-90">
            Bank details + UPI ID + QR settings for Invoice / Receipt
          </p>
        </div>

        <form onSubmit={save} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Bank Details */}
          <div className="lg:col-span-2 space-y-6">
            <SectionTitle title="🏦 Bank Details" />

            <Grid2>
              <Input
                label="Account Holder"
                name="accountHolder"
                value={bankDetails.accountHolder}
                onChange={onChange}
                placeholder="INDIA THERAPY CENTRE"
              />
              <Input
                label="Bank Name"
                name="bankName"
                value={bankDetails.bankName}
                onChange={onChange}
                placeholder="BANK OF BARODA"
              />
              <Input
                label="Account Number"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={onChange}
                placeholder="94950200001445"
              />
              <Input
                label="IFSC"
                name="ifsc"
                value={bankDetails.ifsc}
                onChange={onChange}
                placeholder="BARB0DBDBAD"
              />
              <Input
                label="Branch"
                name="branch"
                value={bankDetails.branch}
                onChange={onChange}
                placeholder="SARAIDHELA"
              />
            </Grid2>

            <SectionTitle title="📌 UPI Details" />

            <Grid2>
              <Input
                label="UPI ID"
                name="upiId"
                value={bankDetails.upiId}
                onChange={onChange}
                placeholder="indiatherapycentre@okaxis"
              />
              <Input
                label="UPI Name"
                name="upiName"
                value={bankDetails.upiName}
                onChange={onChange}
                placeholder="INDIA THERAPY CENTRE"
              />
              <Input
                label="Merchant Code (optional)"
                name="upiMerchantCode"
                value={bankDetails.upiMerchantCode}
                onChange={onChange}
                placeholder="(optional)"
              />
              <Input
                label="Default Note (optional)"
                name="upiNote"
                value={bankDetails.upiNote}
                onChange={onChange}
                placeholder="Therapy Payment"
              />
            </Grid2>

            <SectionTitle title="⚙️ Visibility" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Toggle
                label="Show on Invoice"
                name="showOnInvoice"
                checked={bankDetails.showOnInvoice}
                onChange={onChange}
              />
              <Toggle
                label="Show on Receipt"
                name="showOnReceipt"
                checked={bankDetails.showOnReceipt}
                onChange={onChange}
              />
              <Toggle
                label="Enable UPI QR"
                name="enableUpiQr"
                checked={bankDetails.enableUpiQr}
                onChange={onChange}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 text-slate-700 font-semibold"
              >
                ↻ Refresh
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 ${
                  saving ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          {/* RIGHT: QR Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-800 mb-2">📷 UPI QR Preview</h3>
              <p className="text-xs text-slate-600 mb-3">
                Receipt/Invoice me QR add karne ke liye yahi value use hogi.
              </p>

              {bankDetails.enableUpiQr && upiQrValue ? (
                <div className="bg-white p-3 rounded-xl border flex items-center justify-center">
                  <QRCode value={upiQrValue} size={180} />
                </div>
              ) : (
                <div className="text-sm text-slate-600 bg-white rounded-xl border p-3">
                  QR preview not available. (Enable UPI QR + add UPI ID)
                </div>
              )}

              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-700 mb-1">UPI URL</div>
                <textarea
                  value={upiQrValue || ""}
                  readOnly
                  className="w-full text-xs p-2 rounded-lg border bg-white text-slate-700"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t text-xs text-slate-500">
          ✅ Next: Receipt/Invoice generator me backend se <b>bankDetails</b> fetch karke PDF me print kar dena.
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title }) => (
  <div className="text-base font-extrabold text-slate-800">{title}</div>
);

const Grid2 = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <input
      {...props}
      className="mt-1 w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
    />
  </div>
);

const Toggle = ({ label, name, checked, onChange }) => (
  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} />
    <span className="text-sm font-semibold text-slate-700">{label}</span>
  </label>
);

export default PaymentMethods;
