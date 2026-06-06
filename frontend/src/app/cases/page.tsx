"use client";
import AppLayout from "@/components/layout/AppLayout";
import { BookOpen } from "lucide-react";

export default function CasesPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-5 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Practice Cases</h1>
          <p className="text-gray-500 mt-1">Select a scenario to practice your tax filing skills.</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-[400px]">
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Cases Library Coming Soon</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md">We are currently building out the full library of practice scenarios ranging from basic individual returns to complex corporate filings.</p>
        </div>
      </div>
    </AppLayout>
  );
}
