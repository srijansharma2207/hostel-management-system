import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Search } from "lucide-react";

export default function ServiceRequests() {
  const { isAdmin } = useAuth();
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
            placeholder="Search requests…"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-xs outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all ml-auto"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Request
        </button>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", count: "—" },
            { label: "In Progress", count: "—" },
            { label: "Resolved", count: "—" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-lg border border-border p-4 shadow-sm text-center">
              <p className="text-2xl font-semibold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {["ID", "Type", isAdmin ? "Student / Room" : "Room", "Description", "Priority", "Date", "Status"].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground px-4 py-3 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                No service requests yet. Connect a database to load data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(false)} />
          <div className="relative bg-card rounded-lg border border-border shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold mb-5">Submit Service Request</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModal(false); }}>
              <div>
                <label className="block text-xs font-medium mb-1.5">Request Type</label>
                <select className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors">
                  {["Plumbing", "Electrical", "Cleaning", "Internet", "Furniture", "AC Repair", "Other"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Priority</label>
                <select className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe the issue in detail…" className="w-full px-3 py-2 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="h-9 px-4 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 transition-all" style={{ backgroundColor: "hsl(var(--primary))" }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
