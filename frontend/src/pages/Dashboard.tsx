import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Users, BedDouble, Building2, Wrench } from "lucide-react";

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) => (
  <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center"
        style={{ backgroundColor: "hsl(25,82%,54%,0.12)" }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: "hsl(var(--primary))" }} />
      </div>
    </div>
    <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
  </div>
);

export default function Dashboard() {
  const { isAdmin, user } = useAuth();

  const [stats, setStats] = useState<{
    total_students?: number;
    students_allocated?: number;
    total_hostels?: number;
    total_rooms?: number;
    occupied_rooms?: number;
    total_beds?: number;
    allocated_beds?: number;
    rooms_allocated_percentage?: number;
    beds_allocated_percentage?: number;
  } | null>(null);

  const [recentAllocations, setRecentAllocations] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;

    fetch("http://127.0.0.1:5000/dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    fetch("http://127.0.0.1:5000/allocations")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        const sorted = [...rows].sort((a: any, b: any) => {
          const ad = a?.allocation_date ? new Date(a.allocation_date).getTime() : NaN;
          const bd = b?.allocation_date ? new Date(b.allocation_date).getTime() : NaN;
          if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) return bd - ad;
          const aid = Number(a?.allocation_id ?? 0);
          const bid = Number(b?.allocation_id ?? 0);
          return bid - aid;
        });
        setRecentAllocations(sorted.slice(0, 8));
      })
      .catch(() => setRecentAllocations([]));
  }, [isAdmin]);

  if (!isAdmin) {
    return <StudentDashboard user={user} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Students"
          value={stats?.total_students != null ? stats.total_students.toLocaleString() : "—"}
          icon={Users}
        />
        <StatCard
          label="Students Allocated"
          value={stats?.students_allocated != null ? stats.students_allocated.toLocaleString() : "—"}
          icon={Users}
        />
        <StatCard
          label="Total Rooms"
          value={stats?.total_rooms != null ? stats.total_rooms.toLocaleString() : "—"}
          icon={Building2}
        />
        <StatCard
          label="Available Rooms"
          value={stats?.total_rooms != null && stats?.occupied_rooms != null 
            ? (stats.total_rooms - stats.occupied_rooms).toLocaleString() 
            : "—"}
          icon={BedDouble}
        />
        <StatCard
          label="Allocated Rooms"
          value={stats?.occupied_rooms != null ? stats.occupied_rooms.toLocaleString() : "—"}
          icon={BedDouble}
        />
      </div>

      {/* Occupancy */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <p className="text-sm font-semibold mb-1">Hostel Occupancy Overview</p>
        <p className="text-xs text-muted-foreground">
          {stats?.total_rooms != null && stats?.occupied_rooms != null && stats?.rooms_allocated_percentage != null
            ? `Rooms allocated: ${stats.occupied_rooms}/${stats.total_rooms} (${stats.rooms_allocated_percentage}%)`
            : "—"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {stats?.total_beds != null && stats?.allocated_beds != null && stats?.beds_allocated_percentage != null
            ? `Capacity allocated (occupied beds): ${stats.allocated_beds}/${stats.total_beds} (${stats.beds_allocated_percentage}%)`
            : "—"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Allocations */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Recent Allocations</p>
          </div>
          {recentAllocations.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
              No allocations yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentAllocations.map((a: any, idx) => (
                <div key={idx} className="px-5 py-3 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {a.student_name ?? "—"}
                        {a.student_id != null ? ` (${a.student_id})` : ""}
                      </p>
                      <p className="text-muted-foreground truncate mt-0.5">
                        {(a.hostel ?? "—") + ", " + (a.room_no ?? "—")}
                      </p>
                    </div>
                    <div className="text-muted-foreground whitespace-nowrap">
                      {(() => {
                        if (!a?.allocation_date) return "—";
                        const d = new Date(a.allocation_date);
                        if (Number.isNaN(d.getTime())) return String(a.allocation_date);
                        return d.toLocaleDateString();
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Pending Requests</p>
          </div>
          <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
            No requests yet.
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <p className="text-xs text-muted-foreground mb-0.5">Welcome back</p>
        <h2 className="text-xl font-semibold tracking-tight">{user?.name}</h2>
        <p className="text-xs text-muted-foreground mt-1">Student ID: {user?.studentId}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" icon={Users} value="—" />
        <StatCard label="My Room" icon={BedDouble} value="—" />
        <StatCard label="Fee Due" icon={BedDouble} value="—" />
        <StatCard label="My Requests" icon={Wrench} value="—" />
      </div>

      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <p className="text-sm font-semibold mb-2">My Room Details</p>
        <p className="text-xs text-muted-foreground">No room assigned yet.</p>
      </div>
    </div>
  );
}
