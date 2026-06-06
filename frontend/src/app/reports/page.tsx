"use client";
import AppLayout from "@/components/layout/AppLayout";
import { PieChart } from "lucide-react";

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-5 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-gray-500 mt-1">Analytics and progress tracking.</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-[400px]">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <PieChart className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md">Detailed breakdown of your accuracy, speed, and learning progress will appear here once you complete more modules.</p>
        </div>
      </div>
    </AppLayout>
  );
}
