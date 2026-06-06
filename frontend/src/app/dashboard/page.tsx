"use client";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Users, Calculator, Landmark, Award,
  ArrowUpRight, ArrowRight, FileText, FileCheck2, ShieldCheck,
  Clock, CheckCircle2, Inbox
} from "lucide-react";
import { useState, useEffect } from "react";

const quickLinks = [
  { name: "GST Portal", desc: "File GSTR-1, simulate ARN", href: "/mock/gst", icon: ShieldCheck, accent: "border-l-emerald-500" },
  { name: "TRACES Portal", desc: "TDS deductions, Challan 281", href: "/mock/traces", icon: FileCheck2, accent: "border-l-teal-500" },
  { name: "e-Filing Portal", desc: "ITR computation, Old vs New", href: "/mock/itax", icon: Landmark, accent: "border-l-indigo-500" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    gst_cases: 0,
    tds_cases: 0,
    itr_cases: 0,
  });

  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real counts from backend
    const fetchData = async () => {
      try {
        const [studentsRes] = await Promise.allSettled([
          fetch("http://localhost:8000/api/v1/students/"),
        ]);
        // We'll set real data when endpoints exist, for now show 0
        setStats({
          students: studentsRes.status === "fulfilled" && studentsRes.value.ok
            ? (await studentsRes.value.json()).length || 0
            : 0,
          gst_cases: 0,
          tds_cases: 0,
          itr_cases: 0,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Students Enrolled", value: stats.students, icon: Users, color: "blue" },
    { label: "GST Cases", value: stats.gst_cases, icon: FileText, color: "emerald" },
    { label: "TDS Cases", value: stats.tds_cases, icon: Calculator, color: "violet" },
    { label: "ITR Cases", value: stats.itr_cases, icon: Landmark, color: "amber" },
  ];

  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue:    { bg: "bg-blue-50",    icon: "text-blue-500" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500" },
    violet:  { bg: "bg-violet-50",  icon: "text-violet-500" },
    amber:   { bg: "bg-amber-50",   icon: "text-amber-500" },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Overview of your Taxpilot Academy environment</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const c = colorMap[stat.color];
            return (
              <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-8 w-8 rounded-md ${c.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${c.icon}`} />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                  {loading ? <span className="inline-block w-10 h-6 bg-gray-100 rounded animate-pulse" /> : stat.value}
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[1fr_380px] gap-5">
          {/* Main content */}
          <div className="space-y-5">
            {/* Quick Access */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-[14px] font-semibold text-gray-900">Mock Portals</h2>
                <span className="text-[11px] text-gray-400">Quick access to simulators</span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group border border-gray-100 border-l-[3px] ${link.accent} rounded-md p-4 hover:bg-gray-50 transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <link.icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                    <p className="text-[13px] font-medium text-gray-900">{link.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{link.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Module Progress */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-[14px] font-semibold text-gray-900">Module Progress</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { name: "GST Compliance", sections: "GSTR-1 • GSTR-3B • e-Invoice • e-Way Bill", progress: 0, color: "bg-emerald-500" },
                  { name: "TDS/TCS", sections: "Section 194J • 194C • 194I • Challan 281 • 26Q", progress: 0, color: "bg-teal-500" },
                  { name: "Income Tax", sections: "ITR-1 • ITR-4 • Old vs New Regime • 80C/80D", progress: 0, color: "bg-indigo-500" },
                ].map((mod) => (
                  <div key={mod.name} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-medium text-gray-900">{mod.name}</p>
                        <span className="text-[11px] font-medium text-gray-500">{mod.progress}%</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2 truncate">{mod.sections}</p>
                      <div className="h-[5px] w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${mod.color} transition-all duration-500`} style={{ width: `${mod.progress}%` }} />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — Activity Feed */}
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-[14px] font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
                <Inbox className="h-8 w-8 text-gray-200 mb-3" />
                <p className="text-[13px] text-gray-400 font-medium">No activity yet</p>
                <p className="text-[11px] text-gray-300 mt-1">Start a practice case from any Mock Portal</p>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-[14px] font-semibold text-gray-900">Certifications</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { name: "GST Practitioner — Level 1", status: "Locked" },
                  { name: "TDS Specialist", status: "Locked" },
                  { name: "ITR Filing Expert", status: "Locked" },
                ].map((cert) => (
                  <div key={cert.name} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md flex items-center justify-center bg-gray-50">
                      <Award className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-gray-800 truncate">{cert.name}</p>
                      <p className="text-[10px] font-medium text-gray-300">{cert.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
