"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Award } from "lucide-react";

export default function CertificatesPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-5 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Certificates</h1>
          <p className="text-gray-500 mt-1">View and download your completed practice certificates.</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-[400px]">
          <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Certificates Yet</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md">Complete practice cases in the GST, TDS, and ITR modules to earn your simulation certificates.</p>
        </div>
      </div>
    </AppLayout>
  );
}
