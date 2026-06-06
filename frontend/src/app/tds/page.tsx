"use client";
import AppLayout from "@/components/layout/AppLayout";
import { FileText, Calculator, FileCheck2, AlertCircle, Upload, MessageSquare, Plus, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Deduction {
  deductee_pan: string;
  section_code: string;
  payment_amount: number;
  deduction_date: string;
  tax_deducted: number;
}

export default function TDSPractice() {
  const { user } = useAuth();
  const [caseId, setCaseId] = useState<number | null>(null);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [errors, setErrors] = useState<{ id: string; msg: string }[]>([]);
  
  // New Deduction Form State
  const [newDed, setNewDed] = useState<Deduction>({
    deductee_pan: "", section_code: "194J", payment_amount: 0, deduction_date: "2024-06-15", tax_deducted: 0
  });

  // AI Tutor State
  const [aiMessage, setAiMessage] = useState("Welcome to the TDS Preparation module. Enter your deductee details below. Remember that valid PANs are 10 characters long.");

  const [activeTab, setActiveTab] = useState('Form 26Q (Non-Salary)');

  useEffect(() => {
    const initCase = async () => {
      try {
        const res = await fetch("/_/backend/api/v1/tds/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: user?.id || "unknown",
            deductor_tan: "DELT12345F",
            deductor_pan: "ABCDE1234F",
            financial_year: "2024-25",
            quarter: "Q1",
            form_type: "26Q"
          })
        });
        const data = await res.json();
        if (res.ok) setCaseId(data.case_id);
      } catch (e) {
        console.error("Failed to initialize TDS case", e);
      }
    };
    if (user?.id) {
      initCase();
    }
  }, [user]);

  const validateDeduction = (ded: Deduction) => {
    const errs = [];
    if (!ded.deductee_pan || ded.deductee_pan.length !== 10) {
      errs.push({ id: "PAN", msg: `Deductee PAN must be exactly 10 characters.` });
      setAiMessage(`I noticed an invalid PAN format. If a deductee does not provide a valid PAN, you must deduct TDS at a higher rate (usually 20%) under Section 206AA!`);
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(ded.deductee_pan.toUpperCase())) {
      errs.push({ id: "PAN_FORMAT", msg: `PAN format is invalid (e.g. ABCDE1234F).` });
      setAiMessage(`The PAN format seems incorrect. The 4th character represents the status (e.g., 'P' for Person, 'C' for Company). Check your records.`);
    }

    if (ded.payment_amount <= 0) {
      errs.push({ id: "PAYMENT_VAL", msg: `Payment amount must be greater than zero.` });
    }

    if (!['194J', '194C', '194I', '194A'].includes(ded.section_code)) {
      errs.push({ id: "SECTION", msg: `Section code must be a standard TDS section (e.g., 194J, 194C).` });
    }

    return errs;
  };

  const calculateTds = (section: string, amount: number) => {
    // Simple mock logic for practice module
    const rates: Record<string, number> = {
      '194J': 0.10, // Professional fees
      '194C': 0.02, // Contracts
      '194I': 0.10, // Rent
      '194A': 0.10, // Interest
    };
    return Math.round(amount * (rates[section] || 0.10));
  };

  const handleAddDeduction = async () => {
    if (!caseId) return;
    if (!newDed.deductee_pan) return;

    // Run Validation
    const validationErrors = validateDeduction(newDed);
    setErrors(validationErrors);

    const calculatedTax = calculateTds(newDed.section_code, newDed.payment_amount);
    const finalDeduction = { ...newDed, tax_deducted: calculatedTax, deductee_pan: newDed.deductee_pan.toUpperCase() };

    if (validationErrors.length === 0) {
      setAiMessage(`Perfect! For Section ${newDed.section_code}, the standard TDS rate was applied automatically resulting in ₹${calculatedTax}. You can proceed to the TRACES portal.`);
    }

    // Save locally
    setDeductions([...deductions, finalDeduction]);

    // Push to backend if valid
    if (validationErrors.length === 0) {
      try {
        await fetch(`/_/backend/api/v1/tds/cases/${caseId}/deductions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deductee_pan: finalDeduction.deductee_pan,
            section_code: finalDeduction.section_code,
            payment_amount: finalDeduction.payment_amount,
            deduction_date: finalDeduction.deduction_date
          })
        });
      } catch (e) { console.error(e); }
    }

    // Reset Form
    setNewDed({
      deductee_pan: "", section_code: "194J", payment_amount: 0, deduction_date: "2024-06-15", tax_deducted: 0
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">TDS Preparation Workspace</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Prepare Form 26Q data, run validations, and sync to TRACES.</p>
          </div>
          <div className="flex gap-3">
            <button className="text-[13px] font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Upload className="h-4 w-4" /> Import Excel
            </button>
            <Link href="/mock/traces" className={`text-[13px] font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${deductions.length > 0 && errors.length === 0 ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`}>
              <ArrowRight className="h-4 w-4" /> Push to TRACES Portal
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 gap-5 min-h-0">
          {/* Main Working Area */}
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto">
            
            {/* Form Nav */}
            <div className="grid grid-cols-4 gap-3">
              {['Form 26Q (Non-Salary)', 'Form 24Q (Salary)', 'Form 27Q', 'Challan Status'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`p-3 rounded-lg border text-[13px] font-medium text-center transition-colors ${activeTab === tab ? "border-teal-200 bg-teal-50 text-teal-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {activeTab === 'Form 26Q (Non-Salary)' ? (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-teal-600" />
                  Deductee Details (Annexure I)
                </h2>
                <span className="text-[11px] font-mono bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Case ID: {caseId || "..."}</span>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Deductee PAN</th>
                      <th className="px-4 py-3">Section</th>
                      <th className="px-4 py-3">Date of Payment</th>
                      <th className="px-4 py-3 text-right">Payment (₹)</th>
                      <th className="px-4 py-3 text-right">TDS Deducted (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[13px]">
                    {deductions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No deductions added. Enter details below.</td>
                      </tr>
                    )}
                    {deductions.map((ded, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 uppercase">{ded.deductee_pan}</td>
                        <td className="px-4 py-3 text-gray-600">{ded.section_code}</td>
                        <td className="px-4 py-3 text-gray-600">{ded.deduction_date}</td>
                        <td className="px-4 py-3 text-right text-gray-900 font-mono">₹{ded.payment_amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-900 font-mono font-semibold">₹{ded.tax_deducted.toLocaleString()}</td>
                      </tr>
                    ))}

                    {/* Inline Add Row */}
                    <tr className="bg-teal-50/30">
                      <td className="px-2 py-2">
                        <input type="text" placeholder="ABCDE1234F" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500 outline-none uppercase" value={newDed.deductee_pan} onChange={e => setNewDed({...newDed, deductee_pan: e.target.value.toUpperCase()})} />
                      </td>
                      <td className="px-2 py-2">
                        <select className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500 outline-none" value={newDed.section_code} onChange={e => setNewDed({...newDed, section_code: e.target.value})}>
                          <option value="194J">194J - Professional/Technical</option>
                          <option value="194C">194C - Contractor</option>
                          <option value="194I">194I - Rent</option>
                          <option value="194A">194A - Interest</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="date" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500 outline-none" value={newDed.deduction_date} onChange={e => setNewDed({...newDed, deduction_date: e.target.value})} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" placeholder="50000" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-teal-500 outline-none text-right" value={newDed.payment_amount || ""} onChange={e => setNewDed({...newDed, payment_amount: Number(e.target.value)})} />
                      </td>
                      <td className="px-2 py-2 text-right text-gray-400 italic text-[11px] pr-4">
                        Auto-computed
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button onClick={handleAddDeduction} className="bg-gray-900 text-white px-4 py-2 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Save Deduction
                </button>
              </div>
            </div>
            ) : activeTab === 'Form 24Q (Salary)' ? (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-teal-600" />
                    Salary Details (Annexure II)
                  </h2>
                </div>
                <div className="p-4 flex-1">
                  <table className="w-full text-left whitespace-nowrap border border-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 border-r">Employee PAN</th>
                        <th className="px-4 py-3 border-r">Gross Salary</th>
                        <th className="px-4 py-3 border-r">Exemptions (10)</th>
                        <th className="px-4 py-3 text-right">TDS Deducted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[13px]">
                      <tr>
                        <td className="px-4 py-3 border-r font-mono">ABCD1234E</td>
                        <td className="px-4 py-3 border-r font-mono">₹12,50,000</td>
                        <td className="px-4 py-3 border-r font-mono">₹1,50,000</td>
                        <td className="px-4 py-3 text-right font-mono">₹1,15,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'Form 27Q' ? (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-teal-600" />
                    Non-Resident Payments
                  </h2>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center flex-1">
                  <Calculator className="h-12 w-12 text-teal-200 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Form 27Q Initialization</h3>
                  <p className="text-[13px] text-gray-500 mt-2 max-w-md">
                    Payments made to Non-Residents (NRIs) or foreign companies require a separate Form 27Q filing along with DTAA provisions.
                  </p>
                  <button className="mt-4 bg-teal-50 text-teal-600 px-4 py-2 rounded-md text-[13px] font-medium border border-teal-100">Initialize Form 27Q</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-teal-600" />
                    Challan Verification
                  </h2>
                </div>
                <div className="p-4 flex-1">
                  <table className="w-full text-left whitespace-nowrap border border-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 border-r">BSR Code</th>
                        <th className="px-4 py-3 border-r">Date of Deposit</th>
                        <th className="px-4 py-3 border-r">Challan Serial No.</th>
                        <th className="px-4 py-3 border-r text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[13px]">
                      <tr>
                        <td className="px-4 py-3 border-r font-mono">0291051</td>
                        <td className="px-4 py-3 border-r font-mono">15-May-2026</td>
                        <td className="px-4 py-3 border-r font-mono">12345</td>
                        <td className="px-4 py-3 border-r text-right font-mono">₹45,000</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[11px] font-semibold">MATCHED</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border-r font-mono">0291051</td>
                        <td className="px-4 py-3 border-r font-mono">15-Jun-2026</td>
                        <td className="px-4 py-3 border-r font-mono">67890</td>
                        <td className="px-4 py-3 border-r text-right font-mono">₹10,500</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[11px] font-semibold">UNMATCHED</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-[12px] text-red-700">
                    Warning: You have 1 unmatched challan. Ensure the BSR code and Challan Serial Number match your bank receipt.
                  </div>
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
                {errors.length === 0 && deductions.length === 0 && (
                  <p className="text-[12px] text-gray-500 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" /> Waiting for data...</p>
                )}
                {errors.length === 0 && deductions.length > 0 && (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-md flex items-start gap-2 text-[12px] font-medium">
                    <FileCheck2 className="h-4 w-4 shrink-0 mt-0.5" />
                    Data validated successfully. Ready for TRACES sync!
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="space-y-2">
                    {errors.map((err, i) => (
                      <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[12px] font-semibold text-red-700">Error: {err.id}</p>
                          <p className="text-[11px] text-red-600">{err.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Tutor Chat */}
            <div className="flex-1 min-h-[250px] bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="bg-teal-600 text-white p-3 flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-md">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[13px]">Taxpilot AI Tutor</h3>
                  <p className="text-[10px] text-teal-100">Live Context Engine</p>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-tl-none text-[12px] text-gray-700 leading-relaxed shadow-sm">
                    {aiMessage}
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="relative">
                  <input type="text" placeholder="Ask AI for guidance..." className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pr-10 text-[12px] focus:outline-none focus:ring-1 focus:ring-teal-500" />
                  <button className="absolute right-1 top-1 p-1.5 rounded-full text-teal-600 hover:bg-teal-50 transition-colors">
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
