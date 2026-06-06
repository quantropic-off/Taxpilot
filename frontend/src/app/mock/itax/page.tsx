"use client";
import { toast } from "sonner";
import { extractError } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import { Landmark, FileText, CheckCircle, Calculator, IndianRupee, FileUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function MockITaxPortal() {
  const [caseId, setCaseId] = useState<number | null>(null);
  const [caseData, setCaseData] = useState({
    practice_case_id: 1,
    pan: "",
    assessment_year: "2024-25",
    itr_type: "ITR-1"
  });

  const [incomes, setIncomes] = useState([
    { head_of_income: "Salary", amount: 0 },
    { head_of_income: "House Property", amount: 0 },
    { head_of_income: "Other Sources", amount: 0 }
  ]);

  const [deductions, setDeductions] = useState([
    { section: "80C", amount_claimed: 0 },
    { section: "80D", amount_claimed: 0 }
  ]);

  const [taxResult, setTaxResult] = useState<any>(null);
  const [ack, setAck] = useState<string | null>(null);

  useEffect(() => {
    const savedIncomes = localStorage.getItem('mock_itr_incomes');
    if (savedIncomes) {
      try {
        const parsed = JSON.parse(savedIncomes);
        const mapped = parsed.map((i: any) => ({ head_of_income: i.head || i.head_of_income, amount: i.amount }));
        
        // Merge with existing template to keep all heads visible
        setIncomes(prev => prev.map(p => {
          const found = mapped.find((m: any) => m.head_of_income === p.head_of_income);
          return found ? { ...p, amount: found.amount } : p;
        }));
      } catch(e) {}
    }
    const savedDeds = localStorage.getItem('mock_itr_deductions');
    if (savedDeds) {
      try {
        const parsed = JSON.parse(savedDeds);
        const mapped = parsed.map((d: any) => ({ section: d.section, amount_claimed: d.amount || d.amount_claimed }));
        
        // Merge with existing template
        setDeductions(prev => prev.map(p => {
          const found = mapped.find((m: any) => m.section === p.section);
          return found ? { ...p, amount_claimed: found.amount_claimed } : p;
        }));
      } catch(e) {}
    }
    const savedCaseId = localStorage.getItem('mock_itr_caseId');
    if (savedCaseId) {
      setCaseId(Number(savedCaseId));
      setCaseData(prev => ({ ...prev, pan: "ABCDE1234F" }));
    }
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/itr/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData)
      });
      const data = await res.json();
      if (res.ok) {
        setCaseId(data.case_id);
      } else {
        toast.error(extractError(data.detail || "Error creating case. Check PAN format (e.g. ABCDE1234F)."));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComputeTax = async () => {
    if (!caseId) return toast.error(extractError("Create a case first!"));
    try {
      const payload = {
        incomes: incomes.filter(i => i.amount > 0),
        deductions: deductions.filter(d => d.amount_claimed > 0)
      };
      const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/itr/cases/${caseId}/compute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setTaxResult(data);
      } else {
        toast.error(extractError("Error computing tax"));
      }
    } catch (e) { console.error(e); }
  };

  const handleFileITR = async () => {
    if (!caseId) return;
    const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/itr/cases/${caseId}/file`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setAck(data.ack_number);
  };

  const updateIncome = (index: number, val: number) => {
    const newInc = [...incomes];
    newInc[index].amount = val;
    setIncomes(newInc);
  };

  const updateDeduction = (index: number, val: number) => {
    const newDed = [...deductions];
    newDed[index].amount_claimed = val;
    setDeductions(newDed);
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-600" />
              e-Filing — Mock Simulator
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Compute tax liability, compare Old vs New Regime, and simulate ITR filing</p>
          </div>
          {ack && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-right">
              <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-semibold">Return Filed</p>
              <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">ACK: {ack}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-5">
          {/* Sidebar Form */}
          <div className="bg-white rounded-lg border border-gray-200 h-fit">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Assessee Setup</h2>
            </div>
            <form onSubmit={handleCreateCase} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">PAN</label>
                <input required value={caseData.pan} onChange={e => setCaseData({ ...caseData, pan: e.target.value.toUpperCase() })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 font-mono placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all" placeholder="ABCDE1234F" disabled={!!caseId} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">Assessment Year</label>
                <select value={caseData.assessment_year} onChange={e => setCaseData({ ...caseData, assessment_year: e.target.value })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" disabled={!!caseId}>
                  <option>2024-25</option>
                  <option>2023-24</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">ITR Form</label>
                <select value={caseData.itr_type} onChange={e => setCaseData({ ...caseData, itr_type: e.target.value })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" disabled={!!caseId}>
                  <option>ITR-1</option>
                  <option>ITR-4</option>
                </select>
              </div>
              {!caseId && (
                <button type="submit" className="w-full bg-gray-900 text-white p-2 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Start Filing
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
            {/* Income & Deduction */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Income */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-[13px] font-semibold text-gray-900">Income Details</h2>
                </div>
                <div className="p-4 space-y-3.5">
                  {incomes.map((inc, i) => (
                    <div key={i} className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">{inc.head_of_income}</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[12px] text-gray-400">₹</span>
                        <input type="number" value={inc.amount} onChange={e => updateIncome(i, Number(e.target.value))} className="w-full text-[13px] p-2 pl-7 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-[13px] font-semibold text-gray-900">Chapter VI-A Deductions</h2>
                </div>
                <div className="p-4 space-y-3.5">
                  {deductions.map((ded, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-gray-500">Section {ded.section}</label>
                        {ded.section === "80C" && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200 font-medium">Max ₹1.5L</span>}
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[12px] text-gray-400">₹</span>
                        <input type="number" value={ded.amount_claimed} onChange={e => updateDeduction(i, Number(e.target.value))} className="w-full text-[13px] p-2 pl-7 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compute Button */}
            <button onClick={handleComputeTax} disabled={!caseId} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Calculator className="h-4 w-4" /> Compute Tax Liability
            </button>

            {/* Results */}
            {taxResult && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-[13px] font-semibold text-gray-900">Tax Computation Summary</h2>
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
                    Recommended: {taxResult.recommended}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  <div className="p-5 text-center">
                    <p className="text-[11px] font-medium text-gray-400 uppercase mb-1">Gross Total Income</p>
                    <p className="text-2xl font-semibold text-gray-900 font-mono">₹{taxResult.gti.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Deductions: ₹{taxResult.deductions.toLocaleString()}</p>
                  </div>

                  <div className={`p-5 text-center relative ${taxResult.recommended === "Old Regime" ? "bg-emerald-50/50" : ""}`}>
                    {taxResult.recommended === "Old Regime" && <div className="absolute top-0 inset-x-0 h-[3px] bg-emerald-500 rounded-b" />}
                    <p className="text-[11px] font-medium text-gray-400 uppercase mb-1">Old Regime Tax</p>
                    <p className="text-2xl font-semibold text-gray-900 font-mono">₹{taxResult.old_tax.toLocaleString()}</p>
                  </div>

                  <div className={`p-5 text-center relative ${taxResult.recommended === "New Regime" ? "bg-emerald-50/50" : ""}`}>
                    {taxResult.recommended === "New Regime" && <div className="absolute top-0 inset-x-0 h-[3px] bg-emerald-500 rounded-b" />}
                    <p className="text-[11px] font-medium text-gray-400 uppercase mb-1">New Regime Tax</p>
                    <p className="text-2xl font-semibold text-gray-900 font-mono">₹{taxResult.new_tax.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  <button onClick={handleFileITR} disabled={!!ack} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <FileUp className="h-4 w-4" /> Proceed to e-File Return
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
