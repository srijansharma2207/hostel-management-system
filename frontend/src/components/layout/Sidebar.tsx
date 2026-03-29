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
];

interface SidebarProps {
  onClose: () => void;
  collapsed?: boolean;
  onToggle: () => void;
}

export default function Sidebar({ onClose, collapsed = false, onToggle }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside
      className={`flex flex-col h-full select-none transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ backgroundColor: "hsl(var(--sidebar-background))" }}
    >
      {/* Logo */}
      <div
        className={
          "flex items-center h-16 gap-3 border-b flex-shrink-0 " +
          (collapsed ? "px-3 justify-center" : "px-4")
        }
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <button
          onClick={onToggle}
          className={
            "group relative p-2 rounded-lg transition-colors hover:bg-sidebar-accent flex-shrink-0 " +
            (collapsed ? "" : "mr-1")
          }
          style={{ color: "hsl(var(--sidebar-foreground))" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <div className="w-5 h-4 relative flex flex-col justify-center items-center">
            <span
              className="absolute w-4 h-0.5 rounded-full bg-current transition-all duration-300 ease-in-out"
              style={{
                transform: collapsed ? "translateY(-6px)" : "rotate(45deg)",
                opacity: 0.9,
              }}
            />
            <span
              className="absolute w-4 h-0.5 rounded-full bg-current transition-all duration-300 ease-in-out"
              style={{
                transform: collapsed ? "translateY(0)" : "rotate(-45deg)",
                opacity: collapsed ? 0.9 : 0.9,
              }}
            />
            <span
              className="absolute w-4 h-0.5 rounded-full bg-current transition-all duration-300 ease-in-out"
              style={{
                transform: collapsed ? "translateY(6px)" : "rotate(45deg)",
                opacity: collapsed ? 0.9 : 0,
              }}
            />
          </div>
        </button>

        {!collapsed && (
          <span
            className="font-semibold text-base tracking-tight"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
          >
            HostelHub
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {!collapsed && (
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-5 mb-2"
            style={{ color: "hsl(220,10%,40%)" }}
          >
            {isAdmin ? "Administration" : "My Portal"}
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          {links.map(({ to, icon: Icon, label }) => {
            const active =
              location.pathname === to ||
              (to !== "/dashboard" && location.pathname.startsWith(to));
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                    active ? "text-white" : "hover:bg-sidebar-accent",
                    collapsed && "justify-center px-2"
                  )}
                  style={active ? { backgroundColor: "hsl(var(--primary))" } : {}}
                  title={collapsed ? label : undefined}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? "white" : "hsl(var(--sidebar-foreground))" }}
                  />
                  {!collapsed && (
                    <span style={{ color: active ? "white" : "hsl(var(--sidebar-foreground))" }}>
                      {label}
                    </span>
                  )}
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
        <div className={`flex items-center gap-3 px-4 py-4 ${collapsed ? "justify-center" : ""}`}>
          {!collapsed && (
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
          )}
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
