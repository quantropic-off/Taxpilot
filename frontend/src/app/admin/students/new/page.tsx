"use client";
import { toast } from "sonner";
import { extractError } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    enrollment_date: "",
    status: "Active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://skandaedutech-taxpilot.hf.space/api/v1/students/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push("/admin/students");
      } else {
        const error = await res.json();
        toast.error(extractError(error.detail || "Failed to create student"));
      }
    } catch (error) {
      console.error(error);
      toast.error(extractError("Error submitting form"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Sticky Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b border-border/40">
          <div className="flex items-center gap-4">
            <Link href="/admin/students" className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">New Student</h1>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow"
          >
            <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          {/* Main Details */}
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-border/40 bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-4 text-foreground/80 border-b border-border/40 pb-2">Personal Information</h2>
              <div className="grid gap-5 sm:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-foreground/80">Full Name <span className="text-red-500">*</span></label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Enter student name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-foreground/80">Email Address <span className="text-red-500">*</span></label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="student@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-foreground/80">Password <span className="text-red-500">*</span></label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Create a password" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-foreground/80">Mobile Number</label>
                  <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-foreground/80">Date of Joining</label>
                  <input type="date" value={formData.enrollment_date} onChange={e => setFormData({...formData, enrollment_date: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Properties */}
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-border/40 bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-4 text-foreground/80 border-b border-border/40 pb-2">Enrollment Details</h2>
              <div className="space-y-5 mt-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-foreground/80">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-muted-foreground">Course</label>
                  <select disabled className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm shadow-sm opacity-50 cursor-not-allowed">
                    <option>Select Course (Coming Soon)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium leading-none text-muted-foreground">Batch</label>
                  <select disabled className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm shadow-sm opacity-50 cursor-not-allowed">
                    <option>Select Batch (Coming Soon)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
