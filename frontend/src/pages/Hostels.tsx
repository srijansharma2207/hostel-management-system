import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";

export default function Hostels() {
  const [modal, setModal] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");

  const toNum = (v: any) => {
    if (v === null || v === undefined || v === "") return NaN;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
    const digits = String(v).match(/\d+/g)?.join("") ?? "";
    return digits ? Number(digits) : NaN;
  };

  const deriveBlockNumber = (h: any) => {
    const blockName = h?.block_name;
    const blockNameNum = toNum(blockName);
    if (!Number.isNaN(blockNameNum)) return blockNameNum;

    const direct = h?.hostel_no ?? h?.hostel_number;
    const directNum = toNum(direct);
    if (!Number.isNaN(directNum)) return directNum;

    const label = h?.hostel_name ?? h?.name ?? "";
    const labelNum = toNum(label);
    if (!Number.isNaN(labelNum)) return labelNum;

    const idNum = toNum(h?.hostel_id);
    if (!Number.isNaN(idNum)) return idNum;

    return NaN;
  };

  const filteredHostels = useMemo(() => {
    const q = search.toLowerCase();

    const sorted = [...(hostels as any[])].sort((a: any, b: any) => {
      const ao = deriveBlockNumber(a);
      const bo = deriveBlockNumber(b);
      if (!Number.isNaN(ao) && !Number.isNaN(bo) && ao !== bo) return ao - bo;
      return String(a?.hostel_name ?? a?.name ?? a?.hostel_no ?? "").localeCompare(
        String(b?.hostel_name ?? b?.name ?? b?.hostel_no ?? "")
      );
    });

    return sorted.filter((hostel: any) =>
      String(hostel.block_name ?? "").toLowerCase().includes(q) ||
      String(hostel.hostel_name ?? hostel.name ?? hostel.hostel_no ?? "").toLowerCase().includes(q) ||
      String(hostel.code ?? "").toLowerCase().includes(q) ||
      String(hostel.type ?? hostel.gender ?? "").toLowerCase().includes(q) ||
      String(hostel.warden_name ?? "").toLowerCase().includes(q) ||
      q === "boys" && String(hostel.type ?? hostel.gender ?? "").toLowerCase() === "boys" ||
      q === "girls" && String(hostel.type ?? hostel.gender ?? "").toLowerCase() === "girls"
    );
  }, [hostels, search]);

  const roomStatsByHostelId = useMemo(() => {
    const stats = new Map<string, { total: number; occupied: number }>();

    for (const r of rooms as any[]) {
      const hostelIdRaw = r?.hostel_id;
      if (hostelIdRaw === null || hostelIdRaw === undefined || hostelIdRaw === "") continue;
      const hostelId = String(hostelIdRaw);

      const entry = stats.get(hostelId) ?? { total: 0, occupied: 0 };
      entry.total += 1;

      const status = String(r?.status ?? "").toLowerCase();
      const isOccupied = status === "occupied" || r?.student_id != null;
      if (isOccupied) entry.occupied += 1;

      stats.set(hostelId, entry);
    }

    return stats;
  }, [rooms]);

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:5000/hostels").then((res) => res.json()),
      fetch("http://127.0.0.1:5000/rooms").then((res) => res.json()),
    ])
      .then(([hostelsData, roomsData]) => {
        setHostels(Array.isArray(hostelsData) ? hostelsData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      })
      .catch(err => {
        console.error(err);
        setHostels([]);
        setRooms([]);
      });
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hostels…"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-xs outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Hostel
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredHostels.length} of {hostels.length} hostels found
      </p>

      {filteredHostels.length === 0 ? (
        <div className="bg-card rounded-lg border border-border shadow-sm flex items-center justify-center py-24 text-xs text-muted-foreground">
          {hostels.length === 0 ? "No hostels found. Connect a database to load data." : "No hostels match your search."}
        </div>
      ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredHostels.map((h: any, idx) => (
            <div key={idx} className="bg-card rounded-lg border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {(() => {
                      if (h?.block_name != null && h?.block_name !== "") return String(h.block_name);
                      const bn = deriveBlockNumber(h);
                      if (!Number.isNaN(bn)) return `Block ${bn}`;
                      return "Block —";
                    })()}
                  </h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  h.type === 'Boys' || h.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {h.type || h.gender || '—'}
                </span>
              </div>
              
              <div className="space-y-2">
                {(() => {
                  const hostelIdRaw = h?.hostel_id;
                  const hostelId = hostelIdRaw != null ? String(hostelIdRaw) : "";
                  const s = hostelId ? roomStatsByHostelId.get(hostelId) : undefined;
                  const total = s?.total ?? (typeof h.total_rooms === "number" ? h.total_rooms : Number(h.total_rooms)) ?? 0;
                  const occupied = s?.occupied ?? 0;
                  const available = Math.max(0, total - occupied);
                  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;

                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Total Rooms</span>
                        <span className="text-xs font-medium">{total ?? '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Occupied</span>
                        <span className="text-xs font-medium text-green-600">{occupied}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Available</span>
                        <span className="text-xs font-medium text-blue-600">{total ? available : '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Allocated</span>
                        <span className="text-xs font-medium">{total ? `${pct}%` : '—'}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Warden: {h.warden_name || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(false)} />
          <div className="relative bg-card rounded-lg border border-border shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold mb-5">Add New Hostel</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModal(false); }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Hostel Name", "text", "e.g. Bose Hostel"],
                  ["Code", "text", "e.g. BOS"],
                  ["Type", "text", "Boys / Girls"],
                  ["Warden Name", "text", "Dr. Name"],
                  ["Total Blocks", "number", "4"],
                  ["Total Rooms", "number", "80"],
                ].map(([l, t, p]) => (
                  <div key={l as string}>
                    <label className="block text-xs font-medium mb-1.5">{l}</label>
                    <input type={t as string} placeholder={p as string} className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="h-9 px-4 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 transition-all" style={{ backgroundColor: "hsl(var(--primary))" }}>Add Hostel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
