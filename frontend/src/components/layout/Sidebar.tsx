import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  DoorOpen,
  GitMerge,
  Wrench,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/students", icon: Users, label: "Students" },
  { to: "/hostels", icon: Building2, label: "Hostels" },
  { to: "/rooms", icon: DoorOpen, label: "Rooms" },
  { to: "/allocations", icon: GitMerge, label: "Allocations" },
  { to: "/service-requests", icon: Wrench, label: "Service Requests" },
  { to: "/waiting-list", icon: ClipboardList, label: "Waiting List" },
];

const studentLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/my-room", icon: DoorOpen, label: "My Room" },
  { to: "/service-requests", icon: Wrench, label: "My Requests" },
  { to: "/waiting-list", icon: ClipboardList, label: "Waiting List" },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside
      className="flex flex-col h-full w-60 select-none"
      style={{ backgroundColor: "hsl(var(--sidebar-background))" }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-16 px-5 gap-3 border-b flex-shrink-0"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span
          className="font-semibold text-base tracking-tight"
          style={{ color: "hsl(var(--sidebar-foreground))" }}
        >
          HostelHub
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-5 mb-2"
          style={{ color: "hsl(220,10%,40%)" }}
        >
          {isAdmin ? "Administration" : "My Portal"}
        </p>
        <ul className="space-y-0.5 px-2">
          {links.map(({ to, icon: Icon, label }) => {
            const active =
              location.pathname === to ||
              (to !== "/dashboard" && location.pathname.startsWith(to));
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                    active ? "text-white" : "hover:bg-sidebar-accent"
                  )}
                  style={active ? { backgroundColor: "hsl(var(--primary))" } : {}}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? "white" : "hsl(var(--sidebar-foreground))" }}
                  />
                  <span style={{ color: active ? "white" : "hsl(var(--sidebar-foreground))" }}>
                    {label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div
        className="border-t flex-shrink-0"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "hsl(var(--primary))", color: "white" }}
          >
            {user?.avatar}
          </div>
          <div className="overflow-hidden flex-1">
            <p
              className="text-xs font-medium truncate"
              style={{ color: "hsl(var(--sidebar-foreground))" }}
            >
              {user?.name}
            </p>
            <p className="text-[10px] capitalize" style={{ color: "hsl(220,10%,42%)" }}>
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-sidebar-accent"
            style={{ color: "hsl(220,10%,42%)" }}
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
