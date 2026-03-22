import { useAuth } from "@/context/AuthContext";
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
    <p className="text-2xl font-semibold tracking-tight text-foreground">—</p>
    <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
  </div>
);

export default function Dashboard() {
  const { isAdmin, user } = useAuth();

  if (!isAdmin) {
    return <StudentDashboard user={user} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="—" icon={Users} />
        <StatCard label="Hostels" value="—" icon={Building2} />
        <StatCard label="Rooms Occupied" value="—" icon={BedDouble} />
        <StatCard label="Pending Requests" value="—" icon={Wrench} />
      </div>

      {/* Occupancy */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <p className="text-sm font-semibold mb-1">Hostel Occupancy Overview</p>
        <p className="text-xs text-muted-foreground">No data yet — connect a database to populate.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Allocations */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Recent Allocations</p>
          </div>
          <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
            No allocations yet.
          </div>
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
