"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Settings, Users, Activity, ShieldAlert, Database, Cpu, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/admin/students/stats")
      .then(res => res.json())
      .then(data => setStats(data.data || []))
      .catch(console.error);
  }, []);

  const totalStudents = stats.length;
  const totalFilings = stats.reduce((acc, curr) => acc + curr.gst_cases + curr.tds_cases + curr.itr_cases, 0);
  return (
    <AppLayout>
      <div className="flex flex-col h-full max-w-6xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-muted-foreground" />
              Platform Administration
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage user sessions, AI settings, and system health.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
              <Database className="h-4 w-4" />
              Reset Mock Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Students</p>
              <h2 className="text-2xl font-bold text-foreground">{totalStudents}</h2>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Simulated Filings</p>
              <h2 className="text-2xl font-bold text-foreground">{totalFilings}</h2>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">AI Inferences</p>
              <h2 className="text-2xl font-bold text-foreground">45.2k</h2>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Alerts</p>
              <h2 className="text-2xl font-bold text-foreground">2</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* AI Tuning & Configuration */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <div className="border-b border-border p-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">AI Engine Tuning</h3>
            </div>
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Temperature</label>
                  <span className="text-xs text-muted-foreground">0.3 (Deterministic)</span>
                </div>
                <input type="range" min="0" max="100" defaultValue="30" className="w-full accent-accent" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Hint Strictness</label>
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <input type="range" min="0" max="100" defaultValue="80" className="w-full accent-accent" />
                <p className="text-[11px] text-muted-foreground">Higher strictness prevents the AI from giving away exact answers, enforcing the Socratic method.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <label className="text-sm font-medium text-foreground">Active Knowledge Base</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
                  <option>Tax Rules 2024 (Finance Act 2024)</option>
                  <option>Tax Rules 2023 (Finance Act 2023)</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Sessions & Activity */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                <h3 className="font-semibold text-sm">Recent User Activity</h3>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-2 text-muted-foreground" />
                <input type="text" placeholder="Search users..." className="bg-background border border-border rounded-md pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent" />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/30 text-muted-foreground sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student ID</th>
                    <th className="px-4 py-3 font-medium">GST Cases</th>
                    <th className="px-4 py-3 font-medium">TDS Cases</th>
                    <th className="px-4 py-3 font-medium">ITR Cases</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stats.map((student, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{student.student_id}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-medium">{student.gst_cases} Cases</span></td>
                      <td className="px-4 py-3"><span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-medium">{student.tds_cases} Cases</span></td>
                      <td className="px-4 py-3"><span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-medium">{student.itr_cases} Cases</span></td>
                      <td className="px-4 py-3"><span className="text-xs text-emerald-500 font-medium">Active</span></td>
                    </tr>
                  ))}
                  {stats.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No students have generated cases yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
