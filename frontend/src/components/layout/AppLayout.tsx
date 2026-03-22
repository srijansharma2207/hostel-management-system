import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/hostels": "Hostels",
  "/rooms": "Rooms",
  "/allocations": "Allocations",
  "/service-requests": "Service Requests",
  "/waiting-list": "Waiting List",
  "/my-room": "My Room",
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "HostelHub";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Backdrop — only on small screens when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="fixed inset-y-0 left-0 z-50 lg:static lg:z-auto flex-shrink-0 sidebar-transition overflow-hidden"
        style={{ width: sidebarOpen ? "240px" : "0px" }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((o) => !o)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
