"use client";
import { Bell, Search, HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const breadcrumbMap: Record<string, string[]> = {
  '/dashboard': ['Home', 'Dashboard'],
  '/gst': ['Practice', 'GST'],
  '/tds': ['Practice', 'TDS'],
  '/itr': ['Practice', 'ITR'],
  '/mock/gst': ['Mock Portals', 'GST Portal'],
  '/mock/traces': ['Mock Portals', 'TRACES'],
  '/mock/itax': ['Mock Portals', 'e-Filing'],
  '/cases': ['Academy', 'Practice Cases'],
  '/certificates': ['Academy', 'Certificates'],
  '/reports': ['Academy', 'Reports'],
  '/ai': ['Tools', 'AI Tax Assistant'],
  '/settings': ['Tools', 'Settings'],
};

export default function Header() {
  const pathname = usePathname();
  const crumbs = breadcrumbMap[pathname] || ['Home'];

  return (
    <header className="flex h-[48px] items-center justify-between border-b border-gray-200 bg-white px-5 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">/</span>}
            <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
            <Search className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <input
            className="w-[200px] rounded-md border border-gray-200 bg-gray-50 py-[5px] pl-8 pr-3 text-[12px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
            placeholder="Search... (Ctrl+K)"
            type="search"
          />
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Help */}
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 block h-[6px] w-[6px] rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
