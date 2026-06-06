"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Plus, Search, MoreVertical, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudentList() {
  const [students, setStudents] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const showNotification = (message: string, type: "error" | "success" = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const promptDelete = (id: string) => {
    setStudentToDelete(id);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    const id = studentToDelete;
    setStudentToDelete(null);
    try {
      const res = await fetch(`https://skandaedutech-taxpilot.hf.space/api/v1/students/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== id));
        showNotification("Student deleted successfully.", "success");
      } else {
        showNotification("Failed to delete student.", "error");
      }
    } catch (e) {
      console.error(e);
      showNotification("Error deleting student.", "error");
    }
  };

  useEffect(() => {
    fetch("https://skandaedutech-taxpilot.hf.space/api/v1/students/")
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
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === s.id ? null : s.id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeMenu === s.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-card border border-border/40 rounded-md shadow-lg z-50 py-1 text-sm overflow-hidden">
                            <Link href={`/admin/students/${s.id}`} className="block px-4 py-2 text-foreground/80 hover:bg-muted/50 hover:text-foreground">
                              Track Performance
                            </Link>
                            <button 
                              onClick={() => promptDelete(s.id)}
                              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10"
                            >
                              Delete Student
                            </button>
                          </div>
                        )}
                      </div>
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

      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/40 rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Student</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors shadow"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex items-center gap-2 ${
          notification.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}
    </AppLayout>
  );
}
