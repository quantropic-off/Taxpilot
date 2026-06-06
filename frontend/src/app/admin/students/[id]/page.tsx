"use client";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, User, Activity, BookOpen, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StudentPerformance() {
  const params = useParams();
  const studentId = params?.id;
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We fetch the student data here. For now we filter the stats array to find the right student
    // if a direct endpoint doesn't exist, this is a safe fallback.
    const fetchData = async () => {
      try {
        const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/admin/students/stats");
        if (res.ok) {
          const stats = await res.json();
          // The stats endpoint usually returns a list of student objects
          const found = stats.find((s: any) => String(s.id) === String(studentId));
          if (found) setStudent(found);
        }
      } catch (e) {
        console.error("Failed to fetch student performance:", e);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">Loading performance data...</div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
          <Link href="/admin/students" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
          </Link>
          <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border/40 shadow-sm">
            Student not found. They may have been deleted or do not have performance data yet.
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin/students" className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {student.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{student.email} • ID: {student.id}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold font-mono">{student.progress_percent}%</h3>
                </div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${student.progress_percent}%` }}></div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Modules</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold font-mono">{student.completed_modules || 0}</h3>
                  <span className="text-sm text-muted-foreground font-mono">/ {student.total_modules || 10}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">GST Cases Filed</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold font-mono">{student.completed_cases || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card shadow-sm mt-4">
          <div className="p-4 border-b border-border/40 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Recent Activity & Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Completed GSTR-3B Validation Case</p>
                  <p className="text-[12px] text-muted-foreground">Score: 95% • 2 days ago</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Logged into Taxpilot Portal</p>
                  <p className="text-[12px] text-muted-foreground">3 days ago</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Started ITR-1 Practice Module</p>
                  <p className="text-[12px] text-muted-foreground">In Progress • 5 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
