"use client";
import { toast } from "sonner";
import { extractError } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import { ShieldCheck, FileText, CheckCircle, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function MockGSTPortal() {
  const [caseId, setCaseId] = useState<number | null>(null);
  const [caseData, setCaseData] = useState({
    practice_case_id: 1,
    gstin: "",
    return_period: "2024-05",
    place_of_supply: "",
    transaction_type: "B2B"
  });

  const [invoices, setInvoices] = useState<any[]>([]);
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: "",
    date: "",
    invoice_type: "Regular",
    hsn: "",
    taxable_value: 0,
    tax_rate: 18
  });

  const [arn, setArn] = useState<string | null>(null);
  const [gstr1Json, setGstr1Json] = useState<any>(null);

  useEffect(() => {
    const savedInvoices = localStorage.getItem('mock_gst_invoices');
    if (savedInvoices) {
      try {
        const parsed = JSON.parse(savedInvoices);
        const withTaxes = parsed.map((inv: any) => {
          if ('cgst' in inv) return inv;
          const tax = inv.taxable_value * (inv.tax_rate / 100);
          return {
            ...inv,
            cgst: tax / 2,
            sgst: tax / 2,
            igst: 0
          };
        });
        setInvoices(withTaxes);
      } catch(e) {}
    }
    const savedCaseId = localStorage.getItem('mock_gst_caseId');
    if (savedCaseId) {
      setCaseId(Number(savedCaseId));
      setCaseData(prev => ({ ...prev, gstin: "27ABCDE1234F1Z5", place_of_supply: "27" }));
    }
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/gst/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData)
      });
      const data = await res.json();
      if (res.ok) {
        setCaseId(data.case_id);
      } else {
        toast.error(extractError(data.detail || "Error creating case. Check GSTIN format (e.g. 27ABCDE1234F1Z5)."));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddInvoice = async () => {
    if (!caseId) return toast.error(extractError("Create a case first!"));
    try {
      const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/gst/cases/${caseId}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice)
      });
      const data = await res.json();
      if (res.ok) {
        const isIntra = caseData.gstin.substring(0, 2) === caseData.place_of_supply.substring(0, 2);
        const tax = newInvoice.taxable_value * (newInvoice.tax_rate / 100);
        setInvoices([...invoices, {
          ...newInvoice,
          id: data.invoice_id,
          cgst: isIntra ? tax / 2 : 0,
          sgst: isIntra ? tax / 2 : 0,
          igst: !isIntra ? tax : 0
        }]);
      }
    } catch (e) { console.error(e); }
  };

  const handleGenerateGSTR1 = async () => {
    if (!caseId) return;
    const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/gst/cases/${caseId}/generate-gstr1`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setGstr1Json(data.gstr1_json);
  };

  const handleSimulateARN = async () => {
    if (!caseId) return;
    const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/gst/cases/${caseId}/simulate-arn`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setArn(data.arn);
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              GST Portal — Mock Simulator
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">File GSTR-1, auto-calculate IGST vs CGST/SGST, and generate ARN</p>
          </div>
          {arn && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-right">
              <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-semibold">Return Filed</p>
              <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">{arn}</p>
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
                <label className="text-[11px] font-medium text-gray-500">GSTIN</label>
                <input required value={caseData.gstin} onChange={e => setCaseData({ ...caseData, gstin: e.target.value.toUpperCase() })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 font-mono placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all" placeholder="27ABCDE1234F1Z5" disabled={!!caseId} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">Place of Supply</label>
                <input required value={caseData.place_of_supply} onChange={e => setCaseData({ ...caseData, place_of_supply: e.target.value })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all" placeholder="State Code (e.g. 27)" disabled={!!caseId} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500">Return Period</label>
                <input value={caseData.return_period} onChange={e => setCaseData({ ...caseData, return_period: e.target.value })} className="w-full text-[13px] p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all" type="month" disabled={!!caseId} />
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
            {/* Invoice Entry */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-[13px] font-semibold text-gray-900">Invoice Entries</h2>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 font-medium">Auto-calculates IGST vs CGST/SGST</span>
              </div>

              {/* Add Row */}
              <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 grid grid-cols-6 gap-2.5 items-end">
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">Inv #</label><input value={newInvoice.invoice_number} onChange={e => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">Date</label><input type="date" value={newInvoice.date} onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">HSN</label><input value={newInvoice.hsn} onChange={e => setNewInvoice({ ...newInvoice, hsn: e.target.value })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">Taxable</label><input type="number" value={newInvoice.taxable_value} onChange={e => setNewInvoice({ ...newInvoice, taxable_value: Number(e.target.value) })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1"><label className="text-[10px] font-medium text-gray-400 uppercase">Rate %</label><input type="number" value={newInvoice.tax_rate} onChange={e => setNewInvoice({ ...newInvoice, tax_rate: Number(e.target.value) })} className="w-full text-[12px] p-1.5 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <button onClick={handleAddInvoice} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-1.5 rounded text-[12px] font-medium flex justify-center items-center transition-colors">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </button>
              </div>

              {/* Table */}
              <table className="w-full text-[12px]">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Inv #</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Taxable</th>
                    <th className="px-4 py-2.5 text-right font-semibold">CGST</th>
                    <th className="px-4 py-2.5 text-right font-semibold">SGST</th>
                    <th className="px-4 py-2.5 text-right font-semibold">IGST</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i} className="border-b border-gray-50 font-mono hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-2.5 text-gray-700">{inv.invoice_number}</td>
                      <td className="px-4 py-2.5 text-right text-gray-900">₹{inv.taxable_value.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-600">₹{inv.cgst.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-600">₹{inv.sgst.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right text-blue-600">₹{inv.igst.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900 bg-gray-50/50">₹{(inv.taxable_value + inv.cgst + inv.sgst + inv.igst).toFixed(2)}</td>
                    </tr>
                  ))}
                  {invoices.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[12px] text-gray-400">No invoices added. Create a case and add entries above.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleGenerateGSTR1} disabled={!caseId} className="flex-1 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 p-3.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <FileText className="h-4 w-4 text-blue-500" /> Generate GSTR-1 JSON
              </button>
              <button onClick={handleSimulateARN} disabled={!caseId || !!arn} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle className="h-4 w-4" /> File & Generate ARN
              </button>
            </div>

            {/* JSON Viewer */}
            {gstr1Json && (
              <div className="bg-gray-900 rounded-lg p-5 overflow-auto border border-gray-800">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-3 border-b border-gray-800 pb-2">NIC Compatible GSTR-1 Payload</div>
                <pre className="text-[12px] font-mono text-emerald-400 leading-relaxed">
                  {JSON.stringify(gstr1Json, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
