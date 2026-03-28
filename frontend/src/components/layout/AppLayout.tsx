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

  const toggleSidebar = () => setSidebarOpen((o) => !o);

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
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto flex-shrink-0 sidebar-transition overflow-hidden border-r ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <Sidebar 
          onClose={() => setSidebarOpen(false)} 
          collapsed={!sidebarOpen}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          sidebarOpen={sidebarOpen}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
