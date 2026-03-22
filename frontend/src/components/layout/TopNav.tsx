import { Bell, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopNavProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
  pageTitle: string;
}

export default function TopNav({ sidebarOpen, onMenuClick, pageTitle }: TopNavProps) {
  const { user } = useAuth();

  return (
    <header
      className="h-16 flex items-center px-5 gap-4 border-b flex-shrink-0 sticky top-0 z-30"
      style={{
        backgroundColor: "hsl(var(--card))",
        borderColor: "hsl(var(--border))",
      }}
    >
      {/* Sleek Hamburger Menu */}
      <button
        onClick={onMenuClick}
        className="group relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 flex-shrink-0 overflow-hidden"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        <div className="w-6 h-5 relative flex flex-col justify-center items-center">
          <span
            className="absolute w-5 h-0.5 rounded-full bg-current transition-all duration-300 ease-in-out"
            style={{
              transform: sidebarOpen 
                ? "rotate(45deg) translate(0, 0)" 
                : "translateY(-8px)",
              opacity: sidebarOpen ? 1 : 0.8,
            }}
          />
          <span
            className="absolute w-5 h-0.5 rounded-full bg-current transition-all duration-300 ease-in-out"
            style={{
              transform: sidebarOpen 
                ? "rotate(-45deg) translate(0, 0)" 
                : "translateY(0)",
              opacity: sidebarOpen ? 0 : 0.8,
            }}
          />
          <span
            className="absolute w-5 h-0.5 rounded-full bg-current transition-all duration-300 ease-in-out"
            style={{
              transform: sidebarOpen 
                ? "rotate(45deg) translate(0, 0)" 
                : "translateY(8px)",
              opacity: sidebarOpen ? 1 : 0.8,
            }}
          />
        </div>
        
        {/* Subtle hover effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>

      <h1 className="text-base font-semibold tracking-tight flex-1">{pageTitle}</h1>

      <div className="flex items-center gap-2">
        <button className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span>Search…</span>
          <kbd className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          />
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "hsl(var(--primary))", color: "white" }}
          title={user?.name}
        >
          {user?.avatar}
        </div>
      </div>
    </header>
  );
}
