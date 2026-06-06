"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Calculator, Landmark,
  ShieldCheck, FileCheck2, Award, PieChart,
  MessageSquare, Settings, BookOpen, ChevronDown, LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const studentModules = [
  {
    group: "Practice Modules",
    items: [

      { name: 'GST Practice', href: '/gst', icon: FileText },
      { name: 'TDS Practice', href: '/tds', icon: Calculator },
      { name: 'ITR Practice', href: '/itr', icon: Landmark },
    ]
  },
  {
    group: "Mock Portals",
    items: [
      { name: 'GST Portal', href: '/mock/gst', icon: ShieldCheck },
      { name: 'TRACES Portal', href: '/mock/traces', icon: FileCheck2 },
      { name: 'e-Filing Portal', href: '/mock/itax', icon: Landmark },
    ]
  },
  {
    group: "Academy",
    items: [
      { name: 'Practice Cases', href: '/cases', icon: BookOpen },
      { name: 'Certificates', href: '/certificates', icon: Award },
      { name: 'Reports', href: '/reports', icon: PieChart },
    ]
  },
  {
    group: "Tools",
    items: [
      { name: 'AI Tax Assistant', href: '/ai', icon: MessageSquare },
    ]
  }
];

const adminModules = [
  {
    group: "Administration",
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Student Management', href: '/admin/students', icon: BookOpen },
    ]
  },
  {
    group: "Configuration",
    items: [
      { name: 'AI Tuning', href: '/admin/ai-tuning', icon: MessageSquare },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const modules = user?.role === "admin" ? adminModules : studentModules;

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-gray-200 bg-white select-none shrink-0">
      {/* Brand */}
      <div className="flex h-[52px] items-center px-5 border-b border-gray-100">
        <Link href={user?.role === "admin" ? "/admin" : "/gst"} className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-[6px] bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
            <Landmark className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-gray-900 leading-none tracking-tight">Taxpilot</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {modules.map((section) => (
          <div key={section.group}>
            <button
              onClick={() => toggleGroup(section.group)}
              className="flex items-center justify-between w-full px-2 mb-1 group"
            >
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.08em]">
                {section.group}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-gray-300 transition-transform duration-200 ${
                  collapsedGroups[section.group] ? '-rotate-90' : ''
                }`}
              />
            </button>
            {!collapsedGroups[section.group] && (
              <div className="space-y-[2px]">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150
                        ${isActive
                          ? 'bg-blue-50 text-blue-700 shadow-[inset_2px_0_0_0_#2563eb]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`h-[15px] w-[15px] shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${user?.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
              {user?.name.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-medium text-gray-900 truncate">{user?.name || "User"}</span>
              <span className="text-[10px] text-gray-400 truncate capitalize">{user?.role || "Role"}</span>
            </div>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
