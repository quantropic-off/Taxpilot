"use client";
import AppLayout from "@/components/layout/AppLayout";
import { FileText, Calculator, FileCheck2, AlertCircle, Upload, MessageSquare, Plus, Save, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import Link from "next/link";

interface Invoice {
  invoice_number: string;
  date: string;
  customer_gstin: string;
  taxable_value: number;
  tax_rate: number;
  hsn: string;
}

export default function GSTPractice() {
  const { user } = useAuth();
  const [caseId, setCaseId] = useState<number | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [errors, setErrors] = useState<{ id: string; msg: string }[]>([]);
  
  // New Invoice Form State
  const [newInv, setNewInv] = useState<Invoice>({
    invoice_number: "", date: "2024-05-15", customer_gstin: "", taxable_value: 0, tax_rate: 18, hsn: ""
  });

  // AI Tutor State
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([
    { role: "assistant", content: "Hello! I'm your AI Tax Tutor. Start by adding B2B invoices. Make sure to include HSN codes as they are mandatory." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [activeTab, setActiveTab] = useState('GSTR-1 Outward');

  useEffect(() => {
    // Auto-initialize a practice case
    const initCase = async () => {
      try {
        const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/gst/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: user?.id || "unknown",
            gstin: "27ABCDE1234F1Z5",
            return_period: "2024-05",
            place_of_supply: "27",
            transaction_type: "B2B"
          })
        });
        const data = await res.json();
        if (res.ok) setCaseId(data.case_id);
      } catch (e) {
        console.error(e);
      }
    };
    if (user?.id) {
      initCase();
    }
  }, [user]);

  const validateInvoice = (inv: Invoice) => {
    const errs = [];
    if (!inv.hsn || inv.hsn.length < 4) {
      errs.push({ id: "HSN", msg: `Invoice ${inv.invoice_number} requires a valid 4 or 6-digit HSN code.` });
      // We can optionally trigger AI here, or just let the user ask
      setChatMessages(prev => [...prev, { role: "assistant", content: `I noticed a validation error. HSN codes are mandatory for B2B invoices under GST. A common HSN for IT Services is '998311'. Try updating it!` }]);
    }
    if (inv.taxable_value <= 0) {
      errs.push({ id: "TAX_VAL", msg: `Taxable value for ${inv.invoice_number} must be greater than zero.` });
    }
    if (inv.customer_gstin && inv.customer_gstin.length !== 15) {
      errs.push({ id: "GSTIN", msg: `Customer GSTIN for ${inv.invoice_number} must be exactly 15 characters.` });
    }
    return errs;
  };

  const handleAddInvoice = async () => {
    if (!caseId) return;
    if (!newInv.invoice_number) return;

    // Run Frontend Validation
    const validationErrors = validateInvoice(newInv);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Great job! That invoice passes all GST structural validations. You can add more, or push this to the e-Filing portal." }]);
    }

    // Always save locally so the student can see their mistakes
    setInvoices([...invoices, newInv]);

    // Push to backend if valid
    if (validationErrors.length === 0) {
      try {
        await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/gst/cases/${caseId}/invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice_number: newInv.invoice_number,
            date: newInv.date,
            invoice_type: "Regular",
            hsn: newInv.hsn,
            taxable_value: newInv.taxable_value,
            tax_rate: newInv.tax_rate
          })
        });
      } catch (e) { console.error(e); }
    }

    // Reset Form
    setNewInv({
      invoice_number: "", date: "2024-05-15", customer_gstin: "", taxable_value: 0, tax_rate: 18, hsn: ""
    });
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          context: `Current invoices: ${JSON.stringify(invoices)}`
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (e) {
      console.error("AI chat error:", e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">GST Preparation Workspace</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Prepare GSTR-1, run validations, and sync to the mock portal.</p>
          </div>
          <div className="flex gap-3">
            <button className="text-[13px] font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Upload className="h-4 w-4" /> Bulk Import
            </button>
            <Link href="/mock/gst" className={`text-[13px] font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${invoices.length > 0 && errors.length === 0 ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"}`}>
              <ArrowRight className="h-4 w-4" /> Push to e-Filing Portal
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 gap-5 min-h-0">
          {/* Main Working Area */}
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto">
            
            {/* Form Nav */}
            <div className="grid grid-cols-4 gap-3">
              {['GSTR-1 Outward', 'GSTR-3B Summary', 'GSTR-9 Annual', 'Reconciliation'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`p-3 rounded-lg border text-[13px] font-medium text-center transition-colors ${activeTab === tab ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {activeTab === 'GSTR-1 Outward' ? (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  B2B Invoices (Registered Customers)
                </h2>
                <span className="text-[11px] font-mono bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Case ID: {caseId || "..."}</span>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Invoice No</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">GSTIN</th>
                      <th className="px-4 py-3">HSN Code</th>
                      <th className="px-4 py-3 text-right">Taxable (₹)</th>
                      <th className="px-4 py-3 text-right">Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[13px]">
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No invoices added yet. Enter details below.</td>
                      </tr>
                    )}
                    {invoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-gray-600">{inv.date}</td>
                        <td className="px-4 py-3 text-gray-600">{inv.customer_gstin}</td>
                        <td className="px-4 py-3 text-gray-600">{inv.hsn || <span className="text-red-500 font-bold">Missing</span>}</td>
                        <td className="px-4 py-3 text-right text-gray-900 font-mono">₹{inv.taxable_value.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{inv.tax_rate}%</td>
                      </tr>
                    ))}

                    {/* Inline Add Row */}
                    <tr className="bg-blue-50/30">
                      <td className="px-2 py-2">
                        <input type="text" placeholder="INV-001" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none" value={newInv.invoice_number} onChange={e => setNewInv({...newInv, invoice_number: e.target.value})} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="date" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none" value={newInv.date} onChange={e => setNewInv({...newInv, date: e.target.value})} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" placeholder="15 char GSTIN" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none uppercase" value={newInv.customer_gstin} onChange={e => setNewInv({...newInv, customer_gstin: e.target.value})} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" placeholder="e.g. 998311" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none" value={newInv.hsn} onChange={e => setNewInv({...newInv, hsn: e.target.value})} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" placeholder="50000" className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none text-right" value={newInv.taxable_value || ""} onChange={e => setNewInv({...newInv, taxable_value: Number(e.target.value)})} />
                      </td>
                      <td className="px-2 py-2">
                        <select className="w-full text-[13px] p-1.5 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none text-right" value={newInv.tax_rate} onChange={e => setNewInv({...newInv, tax_rate: Number(e.target.value)})}>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button onClick={handleAddInvoice} className="bg-gray-900 text-white px-4 py-2 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Save Invoice
                </button>
              </div>
            </div>
            ) : activeTab === 'GSTR-3B Summary' ? (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Table 3.1 - Details of Outward Supplies
                  </h2>
                </div>
                <div className="p-4 flex-1">
                  <table className="w-full text-left whitespace-nowrap border border-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 border-r">Nature of Supplies</th>
                        <th className="px-4 py-3 border-r text-right">Total Taxable Value</th>
                        <th className="px-4 py-3 border-r text-right">Integrated Tax</th>
                        <th className="px-4 py-3 text-right">Central Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[13px]">
                      <tr>
                        <td className="px-4 py-3 border-r">(a) Outward taxable supplies</td>
                        <td className="px-4 py-3 border-r text-right font-mono">₹{invoices.reduce((acc, inv) => acc + inv.taxable_value, 0).toLocaleString()}</td>
                        <td className="px-4 py-3 border-r text-right font-mono">₹{invoices.reduce((acc, inv) => acc + (inv.taxable_value * inv.tax_rate / 100), 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono">₹0</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border-r">(b) Outward taxable supplies (zero rated)</td>
                        <td className="px-4 py-3 border-r text-right font-mono">₹0</td>
                        <td className="px-4 py-3 border-r text-right font-mono">₹0</td>
                        <td className="px-4 py-3 text-right font-mono">₹0</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-[12px] text-blue-700">
                    This summary is auto-calculated based on the invoices entered in the GSTR-1 Outward tab.
                  </div>
                </div>
              </div>
            ) : activeTab === 'GSTR-9 Annual' ? (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Annual Return Details
                  </h2>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center flex-1">
                  <FileText className="h-12 w-12 text-indigo-200 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">GSTR-9 Auto-Population</h3>
                  <p className="text-[13px] text-gray-500 mt-2 max-w-md">
                    The GSTR-9 annual return will be auto-populated at the end of the financial year based on your GSTR-1 and GSTR-3B filings. 
                  </p>
                  <button className="mt-4 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md text-[13px] font-medium border border-indigo-100">Fetch from GSTN</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-[400px]">
                <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    GSTR-2B vs Books Reconciliation
                  </h2>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total ITC in Books</p>
                      <p className="text-2xl font-mono text-gray-900">₹45,200</p>
                    </div>
                    <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total ITC in GSTR-2B</p>
                      <p className="text-2xl font-mono text-gray-900">₹40,000</p>
                    </div>
                    <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                      <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1">Unmatched ITC</p>
                      <p className="text-2xl font-mono text-red-600">₹5,200</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: AI GST Tutor & Validation */}
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
                {errors.length === 0 && invoices.length === 0 && (
                  <p className="text-[12px] text-gray-500 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Waiting for data...</p>
                )}
                {errors.length === 0 && invoices.length > 0 && (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-md flex items-start gap-2 text-[12px] font-medium">
                    <FileCheck2 className="h-4 w-4 shrink-0 mt-0.5" />
                    Data validated successfully. Ready for portal sync!
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
              <div className="bg-indigo-600 text-white p-3 flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-md">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[13px]">Taxpilot AI Tutor</h3>
                  <p className="text-[10px] text-indigo-100">Live Context Engine</p>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4 max-h-[300px]">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-indigo-100'}`}>
                      <MessageSquare className={`h-3.5 w-3.5 ${msg.role === 'user' ? 'text-white' : 'text-indigo-600'}`} />
                    </div>
                    <div className={`p-3 rounded-xl text-[12px] leading-relaxed shadow-sm max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-tl-none text-[12px] text-gray-500 italic shadow-sm">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask AI for guidance..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pr-10 text-[12px] focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                  <button 
                    onClick={handleSendChat}
                    disabled={isTyping || !chatInput.trim()}
                    className="absolute right-1 top-1 p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  >
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
