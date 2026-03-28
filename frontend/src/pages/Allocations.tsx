import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";

export default function Allocations() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/allocations")
      .then((res) => res.json())
      .then((data) => {
        setAllocations(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setAllocations([]);
      });
  }, []);

  const filteredAllocations = useMemo(() => {
    const q = search.toLowerCase();
    return allocations.filter((allocation: any) =>
      String(allocation.allocation_id ?? "").toLowerCase().includes(q) ||
      String(allocation.student_id ?? "").toLowerCase().includes(q) ||
      String(allocation.student_name ?? allocation.name ?? "").toLowerCase().includes(q) ||
      String(allocation.room_no ?? allocation.room ?? "").toLowerCase().includes(q) ||
      String(allocation.hostel ?? allocation.block ?? "").toLowerCase().includes(q)
    );
  }, [allocations, search]);

  const formatDate = (v: any) => {
    if (v === null || v === undefined || v === "") return "—";
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
    return String(v);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search allocations…"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-xs outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all ml-auto"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Allocation
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {["Student ID", "Name", "Hostel / Room", "Allocation Date", "Status", ""].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground px-4 py-3 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-xs text-muted-foreground">
                  {allocations.length === 0 ? "No allocations yet. Connect a database to load data." : "No allocations match your search."}
                </td>
              </tr>
            ) : (
              filteredAllocations.map((allocation: any, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="px-4 py-3">{allocation.student_id ?? "—"}</td>
                  <td className="px-4 py-3">{allocation.student_name ?? allocation.name ?? "—"}</td>
                  <td className="px-4 py-3">{allocation.hostel ?? allocation.block ?? "—"}, {allocation.room_no ?? allocation.room ?? "—"}</td>
                  <td className="px-4 py-3">{formatDate(allocation.allocation_date)}</td>
                  <td className="px-4 py-3">
                    {allocation.vacate_date ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">Vacated</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(false)} />
          <div className="relative bg-card rounded-lg border border-border shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold mb-5">New Room Allocation</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModal(false); }}>
              <div className="space-y-3">
                {[
                  ["Student ID", "text", "STU2024XXX"],
                  ["Hostel", "text", "Hostel name"],
                  ["Room Number", "text", "e.g. B-204"],
                  ["Start Date", "date", ""],
                  ["End Date", "date", ""],
                ].map(([l, t, p]) => (
                  <div key={l as string}>
                    <label className="block text-xs font-medium mb-1.5">{l}</label>
                    <input type={t as string} placeholder={p as string} className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="h-9 px-4 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 transition-all" style={{ backgroundColor: "hsl(var(--primary))" }}>Allocate Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
