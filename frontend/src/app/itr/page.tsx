"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Landmark, FileCheck2, AlertCircle, Upload, MessageSquare, Plus, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ITRPractice() {
  const { user } = useAuth();
  const [caseId, setCaseId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ id: string; msg: string }[]>([]);
  
  // ITR State
  const [incomes, setIncomes] = useState<{ head: string, amount: number }[]>([]);
  const [deductions, setDeductions] = useState<{ section: string, amount: number }[]>([]);

  // New Entry State
  const [newInc, setNewInc] = useState({ head: "Salary", amount: 0 });
  const [newDed, setNewDed] = useState({ section: "80C", amount: 0 });

  // AI Tutor State
  const [aiMessage, setAiMessage] = useState("Welcome to ITR Preparation. Start by declaring your Heads of Income. Remember, you can claim deductions, but they are capped by legal limits!");

  const [activeTab, setActiveTab] = useState('Income Sources');

  useEffect(() => {
    const initCase = async () => {
      try {
        const res = await fetch("/_/backend/api/v1/itr/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: user?.id || "unknown",
            pan: "ABCDE1234F",
            assessment_year: "2024-25",
            itr_type: "ITR-1"
          })
        });
        const data = await res.json();
        if (res.ok) setCaseId(data.case_id);
      } catch (e) {
        console.error("Failed to initialize ITR case", e);
      }
    };
    if (user?.id) {
      initCase();
    }
  }, [user]);

  const validateState = (currentIncomes: any[], currentDeds: any[]) => {
    const errs = [];
    const sumIncome = currentIncomes.reduce((a, b) => a + b.amount, 0);
    const sec80C = currentDeds.find(d => d.section === "80C")?.amount || 0;

    if (sumIncome < 0) {
      errs.push({ id: "NEGATIVE_INCOME", msg: "Gross Total Income cannot be negative for ITR-1." });
      setAiMessage("ITR-1 is for simple incomes. You cannot have a net negative income. Please check your entries.");
    }
    
    if (sec80C > 150000) {
      // Soft Warning, but we'll flag it as an error to show the feature
      errs.push({ id: "80C_LIMIT", msg: "Section 80C deduction claimed exceeds ₹1,50,000." });
      setAiMessage(`I noticed you claimed ₹${sec80C.toLocaleString()} under Section 80C. The legal maximum is ₹1,50,000. The e-Filing portal will automatically restrict your claim to ₹1.5L when computing taxes!`);
    }

    if (errs.length === 0 && (currentIncomes.length > 0 || currentDeds.length > 0)) {
      setAiMessage("Your entries look structurally sound! The data is clean. You can push this to the e-Filing portal to compute the final tax liability.");
    }

    return errs;
  };

  const handleAddIncome = () => {
    if (newInc.amount <= 0) return;
    const nextInc = [...incomes, newInc];
    setIncomes(nextInc);
    setErrors(validateState(nextInc, deductions));
    setNewInc({ head: "Salary", amount: 0 });
  };

  const handleAddDeduction = () => {
    if (newDed.amount <= 0) return;
    
    // Check if section already exists, update it if so
    const existingIdx = deductions.findIndex(d => d.section === newDed.section);
    let nextDed;
    if (existingIdx >= 0) {
      nextDed = [...deductions];
      nextDed[existingIdx].amount += newDed.amount;
    } else {
      nextDed = [...deductions, newDed];
    }
    
    setDeductions(nextDed);
    setErrors(validateState(incomes, nextDed));
    setNewDed({ section: "80C", amount: 0 });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">ITR Preparation Workspace</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Prepare Heads of Income, Claim Deductions, and sync to e-Filing.</p>
          </div>
          <div className="flex gap-3">
            <button className="text-[13px] font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Upload className="h-4 w-4" /> Import Form 16
            </button>
            <Link href="/mock/itax" className={`text-[13px] font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${incomes.length > 0 && errors.length === 0 ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`}>
              <ArrowRight className="h-4 w-4" /> Push to e-Filing Portal
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 gap-5 min-h-0">
          {/* Main Working Area */}
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto">
            
            {/* Form Nav */}
            <div className="grid grid-cols-4 gap-3">
              {['Personal Info', 'Income Sources', 'Deductions', 'Taxes Paid'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`p-3 rounded-lg border text-[13px] font-medium text-center transition-colors ${activeTab === tab ? "border-amber-200 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {activeTab === 'Personal Info' ? (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-amber-600" /> Assessee Details
                  </h2>
                </div>
                <div className="p-8 flex-1 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">PAN</label>
                      <input type="text" value="ABCDE1234F" disabled className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[13px] font-medium text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                      <input type="text" value="John Doe" disabled className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[13px] font-medium text-gray-900" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Aadhaar Number</label>
                      <input type="text" value="XXXX-XXXX-1234" disabled className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[13px] font-medium text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</label>
                      <input type="text" value="01-01-1980" disabled className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[13px] font-medium text-gray-900" />
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'Income Sources' ? (
              <div className="flex-1 flex flex-col gap-5">
                {/* Income Table */}
                <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                  <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/50 rounded-t-lg flex justify-between">
                    <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-amber-600" /> Heads of Income
                    </h2>
                  </div>
                  <div className="p-4 space-y-4 flex-1">
                    {incomes.map((inc, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50">
                        <span className="text-[13px] font-medium text-gray-700">{inc.head}</span>
                        <span className="text-[13px] font-mono font-semibold">₹{inc.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <select className="flex-1 text-[13px] p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 outline-none" value={newInc.head} onChange={e => setNewInc({...newInc, head: e.target.value})}>
                        <option>Salary</option>
                        <option>House Property</option>
                        <option>Other Sources</option>
                      </select>
                      <input type="number" placeholder="Amount" className="w-24 text-[13px] p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 outline-none text-right" value={newInc.amount || ""} onChange={e => setNewInc({...newInc, amount: Number(e.target.value)})} />
                      <button onClick={handleAddIncome} className="bg-amber-100 text-amber-700 px-3 rounded hover:bg-amber-200 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'Deductions' ? (
              <div className="flex-1 flex flex-col gap-5">
                {/* Deductions Table */}
                <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                  <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/50 rounded-t-lg flex justify-between">
                    <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-amber-600" /> Chapter VI-A Deductions
                    </h2>
                  </div>
                  <div className="p-4 space-y-4 flex-1">
                    {deductions.map((ded, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50">
                        <span className="text-[13px] font-medium text-gray-700">Section {ded.section}</span>
                        <span className="text-[13px] font-mono font-semibold">₹{ded.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <select className="flex-1 text-[13px] p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 outline-none" value={newDed.section} onChange={e => setNewDed({...newDed, section: e.target.value})}>
                        <option>80C</option>
                        <option>80D</option>
                        <option>80G</option>
                      </select>
                      <input type="number" placeholder="Amount" className="w-24 text-[13px] p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 outline-none text-right" value={newDed.amount || ""} onChange={e => setNewDed({...newDed, amount: Number(e.target.value)})} />
                      <button onClick={handleAddDeduction} className="bg-amber-100 text-amber-700 px-3 rounded hover:bg-amber-200 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-amber-600" /> Taxes Paid (Form 26AS/AIS)
                  </h2>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center flex-1">
                  <FileCheck2 className="h-12 w-12 text-amber-200 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Auto-populated from TRACES</h3>
                  <p className="text-[13px] text-gray-500 mt-2 max-w-md">
                    TDS, TCS, and Advance Tax details will be automatically imported from your Form 26AS.
                  </p>
                  <button className="mt-4 bg-amber-50 text-amber-600 px-4 py-2 rounded-md text-[13px] font-medium border border-amber-100">Sync Form 26AS</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: AI Tutor & Validation */}
          <div className="w-full lg:w-[320px] flex flex-col gap-5">
            
            {/* Validation Panel */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-[13px] font-semibold flex items-center gap-2 text-gray-900">
                  <FileCheck2 className={`h-4 w-4 ${errors.length > 0 ? "text-amber-500" : "text-emerald-500"}`} />
                  Spectrum Validation Engine
                </h3>
              </div>
              <div className="p-4 bg-white min-h-[120px]">
                {errors.length === 0 && incomes.length === 0 && (
                  <p className="text-[12px] text-gray-500 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Waiting for data...</p>
                )}
                {errors.length === 0 && incomes.length > 0 && (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-md flex items-start gap-2 text-[12px] font-medium">
                    <FileCheck2 className="h-4 w-4 shrink-0 mt-0.5" />
                    Data validated successfully. Ready for e-Filing sync!
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="space-y-2">
                    {errors.map((err, i) => (
                      <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[12px] font-semibold text-amber-800">Warning: {err.id}</p>
                          <p className="text-[11px] text-amber-700">{err.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Tutor Chat */}
            <div className="flex-1 min-h-[250px] bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="bg-amber-600 text-white p-3 flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-md">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[13px]">Taxpilot AI Tutor</h3>
                  <p className="text-[10px] text-amber-100">Live Context Engine</p>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-tl-none text-[12px] text-gray-700 leading-relaxed shadow-sm">
                    {aiMessage}
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="relative">
                  <input type="text" placeholder="Ask AI for guidance..." className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pr-10 text-[12px] focus:outline-none focus:ring-1 focus:ring-amber-500" />
                  <button className="absolute right-1 top-1 p-1.5 rounded-full text-amber-600 hover:bg-amber-50 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
