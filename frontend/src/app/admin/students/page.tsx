"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Plus, Search, MoreVertical, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentList() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:7860/api/v1/students/")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage enrollments, courses, and progress.</p>
          </div>
          <Link href="/admin/students/new">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow">
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </button>
          </Link>
        </div>

        <div className="rounded-lg border border-border/40 bg-card shadow-sm">
          <div className="p-4 border-b border-border/40 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search students..." className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9" />
            </div>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 shadow-sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </button>
          </div>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b [&_tr]:border-border/40 bg-muted/20">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]">ID</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Progress</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border/40 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-mono text-muted-foreground">{s.id}</td>
                    <td className="p-4 align-middle font-medium">{s.name}</td>
                    <td className="p-4 align-middle text-muted-foreground">{s.email}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{s.status}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${s.progress_percent}%` }}></div>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">{s.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground flex-col items-center justify-center">
                      <p>No students found.</p>
                      <p className="text-xs mt-1">Create one to get started.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
