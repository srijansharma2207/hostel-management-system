import { useAuth } from "@/context/AuthContext";
import { BedDouble, CreditCard, Wifi, Wind, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export default function MyRoom() {
  const { user } = useAuth();
  if (!user) return null;

  const [studentRow, setStudentRow] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const sid = user?.studentId;
    if (!sid) {
      setStudentRow(null);
      return;
    }

    fetch("http://127.0.0.1:5000/students")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        const match = rows.find((r: any) => String(r?.id) === String(sid));
        setStudentRow(match ?? null);
      })
      .catch(() => setStudentRow(null));
  }, [user?.studentId]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setRooms([]));
  }, []);

  const derivedRoom = studentRow?.room ?? user?.roomNo;
  const derivedBlock = studentRow?.block ?? studentRow?.block_no ?? user?.hostel ?? user?.blockNo;
  const hasRoom = derivedRoom != null && String(derivedRoom).trim() !== "" && derivedRoom !== "—";
  const feeValue = user?.fee;

  const normalizeRoomNo = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).trim();
    if (!s) return "";
    const digits = s.replace(/\D+/g, "");
    if (!digits) return "";
    const n = Number(digits);
    if (!Number.isNaN(n)) return String(n);
    return digits.replace(/^0+/, "");
  };

  const roomRow = (() => {
    if (!hasRoom) return null;
    const key = normalizeRoomNo(derivedRoom);
    return (
      rooms.find(
        (r: any) => normalizeRoomNo(r?.room_no ?? r?.room_number ?? r?.room_num ?? r?.room ?? "") === key
      ) ?? null
    );
  })();

  const displayBlock =
    (derivedBlock && derivedBlock !== "—" ? derivedBlock : undefined) ??
    roomRow?.hostel ??
    roomRow?.block ??
    roomRow?.hostel_id ??
    roomRow?.building ??
    "—";
  const displayFloor = roomRow?.floor ?? "—";
  const displayRoomType = roomRow?.room_type ?? roomRow?.type ?? "—";
  const displayAc = roomRow?.ac_type ?? roomRow?.ac ?? "—";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border" style={{ backgroundColor: "hsl(25,82%,54%,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>
            Current Accommodation
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-0.5">
            {hasRoom ? `${displayBlock}, ${derivedRoom}` : "No room assigned yet"}
          </h2>
        </div>
        <div className="p-8 text-center text-xs text-muted-foreground">
          {hasRoom ? (
            <div className="space-y-1">
              <p>Block: {String(displayBlock)}</p>
              <p>Room No: {String(derivedRoom)}</p>
              <p>Floor: {String(displayFloor)}</p>
              <p>Room Type: {String(displayRoomType)}</p>
              <p>AC: {String(displayAc)}</p>
            </div>
          ) : (
            "Your room details will appear here once a room is allocated."
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-5">
        <p className="text-sm font-semibold mb-2">Fee Payment Status</p>
        <p className="text-xs text-muted-foreground">
          {feeValue != null ? `Fee Due: ${feeValue.toLocaleString("en-IN")}` : "No fee information available yet."}
        </p>
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
