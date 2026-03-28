import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopNavProps {
  sidebarOpen: boolean;
  pageTitle: string;
}

export default function TopNav({ sidebarOpen, pageTitle }: TopNavProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      className="h-16 flex items-center px-5 gap-4 border-b flex-shrink-0 sticky top-0 z-30"
      style={{
        backgroundColor: "hsl(var(--card))",
        borderColor: "hsl(var(--border))",
      }}
    >
      <h1 className="text-base font-semibold tracking-tight flex-1">{pageTitle}</h1>

      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "hsl(var(--primary))", color: "white" }}
            aria-label="Open user menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={user?.name}
          >
            {user?.avatar}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-lg overflow-hidden z-50"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize truncate">{user?.role}</p>
              </div>

              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
