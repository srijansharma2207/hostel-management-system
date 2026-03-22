import { useAuth } from "@/context/AuthContext";
import { BedDouble, CreditCard, Wifi, Wind, Users, Calendar } from "lucide-react";

export default function MyRoom() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border" style={{ backgroundColor: "hsl(25,82%,54%,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>
            Current Accommodation
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-0.5">No room assigned yet</h2>
        </div>
        <div className="p-8 text-center text-xs text-muted-foreground">
          Your room details will appear here once a room is allocated. Connect a database to load your data.
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-5">
        <p className="text-sm font-semibold mb-2">Fee Payment Status</p>
        <p className="text-xs text-muted-foreground">No fee information available yet.</p>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-5">
        <p className="text-sm font-semibold mb-3">Room Amenities</p>
        <div className="flex flex-wrap gap-2">
          {["Wi-Fi", "Study Table", "Wardrobe", "Attached Bathroom", "Hot Water", "24/7 Security", "Laundry Room", "Mess Access"].map((a) => (
            <span key={a} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-md font-medium">{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
