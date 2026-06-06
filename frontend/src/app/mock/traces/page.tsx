"use client";
import AppLayout from "@/components/layout/AppLayout";
import { FileCheck2, Plus, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function MockTracesPortal() {
  const [caseId, setCaseId] = useState<number | null>(null);
  const [caseData, setCaseData] = useState({
    practice_case_id: 1,
    deductor_tan: "",
    deductor_pan: "",
    financial_year: "2024-25",
    quarter: "Q1",
    form_type: "26Q"
  });

  const [deductions, setDeductions] = useState<any[]>([]);
  const [newDeduction, setNewDeduction] = useState({
    deductee_pan: "",
    section_code: "194J",
    payment_amount: 0,
    deduction_date: ""
  });

  const [challanJson, setChallanJson] = useState<any>(null);
  const [prn, setPrn] = useState<string | null>(null);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/tds/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData)
      });
      const data = await res.json();
      if (res.ok) {
        setCaseId(data.case_id);
      } else {
        alert(data.detail || "Error creating case. Check TAN/PAN format.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDeduction = async () => {
    if (!caseId) return alert("Create a case first!");
    try {
      const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/tds/cases/${caseId}/deductions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeduction)
      });
      const data = await res.json();
      if (res.ok) {
        const isInvalidPan = !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(newDeduction.deductee_pan);
        let rate = 10;
        if (newDeduction.section_code === "194C") rate = 1;
        if (isInvalidPan) rate = 20;
        const tax = newDeduction.payment_amount * (rate / 100);
        setDeductions([...deductions, { ...newDeduction, id: data.deduction_id, tax_rate: rate, tds_amount: tax }]);
      } else {
        alert(data.detail || "Error adding deduction.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateChallan = async () => {
    if (!caseId) return;
    const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/tds/cases/${caseId}/generate-challan`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setChallanJson(data.challan);
  };

  const handleSimulateFiling = async () => {
    if (!caseId) return;
    const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/tds/cases/${caseId}/file-26q`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setPrn(data.receipt_number);
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-teal-600" />
              TRACES — Mock Simulator
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">TDS Reconciliation, Challan ITNS 281, and Form 26Q filing</p>
          </div>
          {prn && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-right">
              <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-semibold">Return Filed</p>
              <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">PRN: {prn}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-5">
          {/* Sidebar Form */}
          <div className="bg-white rounded-lg border border-gray-200 h-fit">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Case Setup</h2>
            </div>
            <form onSubmit={handleCreateCase} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">Deductor TAN</label>
                <input required value={caseData.deductor_tan} onChange={e => setCaseData({ ...caseData, deductor_tan: e.target.value.toUpperCase() })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 font-mono placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all" placeholder="DELT12345F" disabled={!!caseId} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">Deductor PAN</label>
                <input required value={caseData.deductor_pan} onChange={e => setCaseData({ ...caseData, deductor_pan: e.target.value.toUpperCase() })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 font-mono placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all" placeholder="ABCDE1234F" disabled={!!caseId} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-500">FY</label>
                  <select value={caseData.financial_year} onChange={e => setCaseData({ ...caseData, financial_year: e.target.value })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" disabled={!!caseId}>
                    <option>2023-24</option>
                    <option>2024-25</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-500">Quarter</label>
                  <select value={caseData.quarter} onChange={e => setCaseData({ ...caseData, quarter: e.target.value })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" disabled={!!caseId}>
                    <option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">Form Type</label>
                <select value={caseData.form_type} onChange={e => setCaseData({ ...caseData, form_type: e.target.value })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" disabled={!!caseId}>
                  <option>24Q</option><option>26Q</option>
                </select>
              </div>
              {!caseId && (
                <button type="submit" className="w-full bg-gray-900 text-white p-2 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors">
                  Initialize Case
                </button>
              )}
              {caseId && (
                <div className="bg-emerald-50 text-emerald-700 p-2 text-center text-[12px] font-medium rounded-md border border-emerald-200 flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> Case Active (ID: {caseId})
                </div>
              )}
            </form>
          </div>

          {/* Main Area */}
          <div className="space-y-5">
            {/* Deductions Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-[13px] font-semibold text-gray-900">Deductee Entries</h2>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 font-medium">Auto-calculates TDS by Section & PAN</span>
              </div>

              <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 grid grid-cols-5 gap-2.5 items-end">
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">Deductee PAN</label><input value={newDeduction.deductee_pan} onChange={e => setNewDeduction({ ...newDeduction, deductee_pan: e.target.value.toUpperCase() })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-gray-400 uppercase">Section</label>
                  <select value={newDeduction.section_code} onChange={e => setNewDeduction({ ...newDeduction, section_code: e.target.value })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="194J">194J (10%)</option>
                    <option value="194C">194C (1%)</option>
                    <option value="194I">194I (10%)</option>
                  </select>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">Amount</label><input type="number" value={newDeduction.payment_amount} onChange={e => setNewDeduction({ ...newDeduction, payment_amount: Number(e.target.value) })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">Date</label><input type="date" value={newDeduction.deduction_date} onChange={e => setNewDeduction({ ...newDeduction, deduction_date: e.target.value })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <button onClick={handleAddDeduction} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-1.5 rounded text-[12px] font-medium flex justify-center items-center transition-colors">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </button>
              </div>

              <table className="w-full text-[12px]">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Deductee PAN</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Section</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Payment</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Rate %</th>
                    <th className="px-4 py-2.5 text-right font-semibold">TDS Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 font-mono hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-2.5 text-gray-700">{d.deductee_pan}</td>
                      <td className="px-4 py-2.5 text-gray-600">{d.section_code}</td>
                      <td className="px-4 py-2.5 text-right text-gray-900">₹{d.payment_amount.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${d.tax_rate === 20 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
                          {d.tax_rate}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-teal-700 bg-gray-50/50">₹{d.tds_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {deductions.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[12px] text-gray-400">No deductions added. Create a case and add entries above.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleGenerateChallan} disabled={!caseId} className="flex-1 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 p-3.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <FileText className="h-4 w-4 text-teal-500" /> Generate Challan 281
              </button>
              <button onClick={handleSimulateFiling} disabled={!caseId || !!prn} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white p-3.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle className="h-4 w-4" /> Simulate Form 26Q Filing
              </button>
            </div>

            {/* JSON Viewer */}
            {challanJson && (
              <div className="bg-gray-900 rounded-lg p-5 overflow-auto border border-gray-800">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-3 border-b border-gray-800 pb-2">ITNS 281 Challan Mock</div>
                <pre className="text-[12px] font-mono text-emerald-400 leading-relaxed">
                  {JSON.stringify(challanJson, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
