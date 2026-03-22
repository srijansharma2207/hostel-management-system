import { useState } from "react";
import { Plus } from "lucide-react";

export default function Hostels() {
  const [modal, setModal] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">No hostels yet.</p>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Hostel
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm flex items-center justify-center py-24 text-xs text-muted-foreground">
        No hostels found. Connect a database to load data.
      </div>

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
