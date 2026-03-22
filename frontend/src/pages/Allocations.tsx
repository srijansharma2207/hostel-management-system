import { useState } from "react";
import { Plus, Search } from "lucide-react";

export default function Allocations() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);

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
              {["Alloc. ID", "Student", "Hostel / Room", "Type", "Period", "Fee/Month", "Status"].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground px-4 py-3 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                No allocations yet. Connect a database to load data.
              </td>
            </tr>
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
