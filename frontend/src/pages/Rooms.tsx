import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Filter } from "lucide-react";

export default function Rooms() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hostelNameById, setHostelNameById] = useState<Record<string, string>>({});

  const getCI = (obj: any, key: string) => {
    if (!obj || typeof obj !== "object") return undefined;
    if (key in obj) return obj[key];

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = normalize(key);

    const found = Object.keys(obj).find((k) => normalize(k) === target);
    return found ? (obj as any)[found] : undefined;
  };

  useEffect(() => {
    fetch("http://127.0.0.1:5000/rooms")
      .then(res => res.json())
      .then(data => {
        const rows = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.rooms)
            ? (data as any).rooms
            : data && typeof data === "object"
              ? [data]
              : [];

        setRooms(rows);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setRooms([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/hostels")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        const map: Record<string, string> = {};
        for (const h of rows) {
          const idRaw = (h as any)?.hostel_id ?? (h as any)?.HOSTEL_ID ?? getCI(h, "hostel_id");
          const id = idRaw != null && idRaw !== "" ? String(idRaw) : "";
          if (!id) continue;
          const labelRaw =
            (h as any)?.block_name ??
            (h as any)?.BLOCK_NAME ??
            getCI(h, "block_name") ??
            (h as any)?.hostel_name ??
            (h as any)?.name;
          const label = labelRaw != null && labelRaw !== "" ? String(labelRaw) : `Block ${id}`;
          map[id] = label;
        }
        setHostelNameById(map);
      })
      .catch((err) => {
        console.error(err);
        setHostelNameById({});
      });
  }, []);

  const filteredRooms = useMemo(() => {
    const q = search.toLowerCase().trim();

    const toNum = (v: any) => {
      if (v === null || v === undefined) return NaN;
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
      const digits = String(v).match(/\d+/g)?.join("") ?? "";
      return digits ? Number(digits) : NaN;
    };

    const getHostelId = (r: any) => r.hostel_id ?? r.hostelId ?? r.HOSTEL_ID ?? getCI(r, "hostel_id");
    const getRoomNo = (r: any) => r.room_no ?? r.room_number ?? r.room_numbe ?? r.room_num ?? r.room ?? r.ROOM_NUMBE ?? getCI(r, "room_no") ?? getCI(r, "room_numbe") ?? getCI(r, "room_number");

    const getBlockLabel = (r: any) => {
      const hid = getHostelId(r);
      const key = hid != null && hid !== "" ? String(hid) : "";
      return (key && hostelNameById[key]) ? hostelNameById[key] : (key ? `Block ${key}` : "");
    };

    const getType = (r: any) =>
      getCI(r, "room_type") ?? r.room_type ?? r.ROOM_TYPE ?? r.roomType ?? r.type ?? getCI(r, "type");
    const getAc = (r: any) =>
      getCI(r, "ac_type") ?? r.ac_type ?? r.AC_TYPE ?? r.acType ?? r.ac ?? getCI(r, "ac");

    const getTypeFromCapacity = (r: any) => {
      const cap = Number(r?.capacity);
      if (cap === 1) return "Single";
      if (cap === 2) return "Double";
      if (cap === 3) return "Triple";
      return undefined;
    };

    const sorted = [...(rooms as any[])].sort((a, b) => {
      const ah = toNum(getHostelId(a));
      const bh = toNum(getHostelId(b));
      if (!Number.isNaN(ah) && !Number.isNaN(bh) && ah !== bh) return ah - bh;
      if (!Number.isNaN(ah) && Number.isNaN(bh)) return -1;
      if (Number.isNaN(ah) && !Number.isNaN(bh)) return 1;

      const ar = toNum(getRoomNo(a));
      const br = toNum(getRoomNo(b));
      if (!Number.isNaN(ar) && !Number.isNaN(br) && ar !== br) return ar - br;
      return String(getRoomNo(a) ?? "").localeCompare(String(getRoomNo(b) ?? ""));
    });

    return sorted.filter((room: any) => {
      if (q === "") return true;
      return (
        String(getRoomNo(room) ?? "").toLowerCase().includes(q) ||
        String(room.block ?? "").toLowerCase().includes(q) ||
        String(getBlockLabel(room) ?? "").toLowerCase().includes(q) ||
        String(getHostelId(room) ?? "").toLowerCase().includes(q) ||
        String(room.floor ?? "").toLowerCase().includes(q) ||
        String(getType(room) ?? getTypeFromCapacity(room) ?? "").toLowerCase().includes(q) ||
        String(getAc(room) ?? "").toLowerCase().includes(q) ||
        String(room.capacity ?? "").toLowerCase().includes(q) ||
        String(room.status ?? room.occupied ?? room.OCCUPIED ?? "").toLowerCase().includes(q)
      );
    });
  }, [rooms, search, hostelNameById]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms…"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-xs outline-none focus:border-primary transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 h-9 px-3 rounded-md border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all ml-auto"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Room
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {["Room No.", "Block", "Floor", "Type", "AC", "Capacity", "Status"].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground px-4 py-3 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                  Loading rooms...
                </td>
              </tr>
            ) : filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                  {rooms.length === 0 ? "No rooms found." : "No rooms match your search."}
                </td>
              </tr>
            ) : (
              filteredRooms.map((room: any, idx) => {
                const derivedRoomNo = room.room_no ?? room.room_number ?? room.room_numbe ?? room.room_num ?? room.room ?? room.ROOM_NUMBE ?? getCI(room, "room_no") ?? getCI(room, "room_numbe") ?? getCI(room, "room_number") ?? "—";
                const hostelId = room.hostel_id ?? room.hostelId ?? room.HOSTEL_ID ?? getCI(room, "hostel_id");
                const hostelKey = hostelId != null && hostelId !== "" ? String(hostelId) : "";
                const derivedBlock =
                  room.block ??
                  (hostelKey && hostelNameById[hostelKey]
                    ? hostelNameById[hostelKey]
                    : hostelId != null && hostelId !== ""
                      ? `Block ${hostelId}`
                      : "—"
                  );
                const derivedTypeRaw = getCI(room, "room_type") ?? room.room_type ?? room.ROOM_TYPE ?? room.roomType ?? room.type ?? getCI(room, "type");
                const derivedAcRaw = getCI(room, "ac_type") ?? room.ac_type ?? room.AC_TYPE ?? room.acType ?? room.ac ?? getCI(room, "ac");
                const derivedType =
                  derivedTypeRaw != null && derivedTypeRaw !== ""
                    ? String(derivedTypeRaw)
                    : Number(room?.capacity) === 1
                      ? "Single"
                      : Number(room?.capacity) === 2
                        ? "Double"
                        : Number(room?.capacity) === 3
                          ? "Triple"
                          : "—";

                const normalizeAc = (v: any) => {
                  if (v === null || v === undefined) return "";
                  const s = String(v).trim().toLowerCase();
                  if (s === "") return "";
                  if (["y", "yes", "true", "1", "ac"].includes(s)) return "AC";
                  if (["n", "no", "false", "0", "nonac", "non-ac", "non ac"].includes(s)) return "Non-AC";
                  return String(v).trim();
                };

                const derivedAcNormalized = normalizeAc(derivedAcRaw);
                const derivedAc = derivedAcNormalized !== "" ? derivedAcNormalized : "—";
                const derivedCapacity = room.capacity ?? "—";

                const rawStatus = room.status;
                const occupiedRaw = room.occupied ?? room.OCCUPIED;
                const statusText = String(
                  rawStatus != null && rawStatus !== ""
                    ? rawStatus
                    : occupiedRaw != null && occupiedRaw !== ""
                      ? Number(occupiedRaw) > 0
                        ? "Occupied"
                        : "Available"
                      : "—"
                );

                const isOccupied = statusText.toLowerCase() === "occupied";
                const statusColor = isOccupied ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
                
                return (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-4 py-3">{derivedRoomNo}</td>
                    <td className="px-4 py-3">{derivedBlock}</td>
                    <td className="px-4 py-3">{Number(room.floor) === 0 ? "Ground" : (room.floor ?? '—')}</td>
                    <td className="px-4 py-3">{derivedType}</td>
                    <td className="px-4 py-3">{derivedAc}</td>
                    <td className="px-4 py-3">{derivedCapacity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(false)} />
          <div className="relative bg-card rounded-lg border border-border shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold mb-5">Add New Room</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModal(false); }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Room Number", "text", "e.g. A-201"],
                  ["Hostel", "text", "Hostel name"],
                  ["Block", "text", "A / B / C"],
                  ["Floor", "text", "1st / 2nd"],
                  ["Room Type", "text", "Single/Double/Triple"],
                  ["Monthly Fee", "number", "8500"],
                ].map(([l, t, p]) => (
                  <div key={l as string}>
                    <label className="block text-xs font-medium mb-1.5">{l}</label>
                    <input type={t as string} placeholder={p as string} className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="h-9 px-4 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 transition-all" style={{ backgroundColor: "hsl(var(--primary))" }}>Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
