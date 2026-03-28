import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Building2 } from "lucide-react";

const credentials = [
  { label: "Admin", username: "admin", password: "admin123", color: "text-primary" },
  { label: "Student", username: "student", password: "student123", color: "text-muted-foreground" },
];

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    total_students?: number;
    total_hostels?: number;
    occupancy_percentage?: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard-stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setStats(null);
      }
    };
    
    fetchStats();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (!ok) setError("Invalid username or password. Try the demo credentials below.");
      setLoading(false);
    }, 400);
  };

  const fillCreds = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12"
        style={{ backgroundColor: "hsl(220,18%,11%)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">HostelHub</span>
        </div>

        <div>
          <p className="text-4xl font-semibold leading-snug text-white mb-4" style={{ letterSpacing: "-0.03em" }}>
            Manage every room,<br />
            every student,<br />
            <span style={{ color: "hsl(var(--primary))" }}>effortlessly.</span>
          </p>
          <p className="text-sm" style={{ color: "hsl(220,10%,55%)" }}>
            A complete hostel management platform for university administrators and students.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              val: stats?.total_students != null ? stats.total_students.toLocaleString() : "—",
              label: "Students",
            },
            {
              val: stats?.total_hostels != null ? String(stats.total_hostels) : "—",
              label: "Hostels",
            },
            {
              val: stats?.occupancy_percentage != null ? `${stats.occupancy_percentage}%` : "—",
              label: "Occupancy",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-md p-4" style={{ backgroundColor: "hsl(220,15%,17%)" }}>
              <p className="text-2xl font-semibold text-white mb-0.5">{s.val}</p>
              <p className="text-xs" style={{ color: "hsl(220,10%,55%)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "hsl(var(--primary))" }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight">HostelHub</span>
          </div>

          <h1 className="text-2xl font-semibold mb-1" style={{ letterSpacing: "-0.03em" }}>
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or student"
                className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-md border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md text-sm font-medium text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ backgroundColor: "hsl(var(--primary))" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-7 p-4 rounded-md border border-border bg-muted/40">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Demo credentials</p>
            <div className="space-y-2">
              {credentials.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => fillCreds(c.username, c.password)}
                  className="w-full flex items-center justify-between text-left rounded px-3 py-2 text-xs border border-border bg-card hover:border-primary/50 transition-colors group"
                >
                  <span className="font-medium text-foreground">{c.label}</span>
                  <span className="text-muted-foreground font-mono group-hover:text-foreground transition-colors">
                    {c.username} / {c.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
