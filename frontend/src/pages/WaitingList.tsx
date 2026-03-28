import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Search } from "lucide-react";

export default function WaitingList() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [waitingList, setWaitingList] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/waiting-list")
      .then(res => res.json())
      .then(data => setWaitingList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return waitingList.filter((item: any) =>
      q === "" ||
      String(item.student_id ?? "").toLowerCase().includes(q) ||
      String(item.course ?? "").toLowerCase().includes(q) ||
      String(item.preferred_hostel ?? "").toLowerCase().includes(q) ||
      String(item.preferred_room_type ?? "").toLowerCase().includes(q)
    );
  }, [waitingList, search]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search waiting list…"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-xs outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all ml-auto"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdmin ? "Add to Waiting List" : "Apply for Hostel"}
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-muted/30 border-b border-border">
          <span className="text-xs font-semibold text-foreground">{waitingList.length} students waiting</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {["#", "Student", "Course", "Hostel Preference", "Room Preference", "Applied On", isAdmin ? "Actions" : ""].map((h, i) => (
                <th key={i} className="text-left font-semibold text-muted-foreground px-4 py-3 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                  {waitingList.length === 0 ? "Waiting list is empty. Connect a database to load data." : "No entries match your search."}
                </td>
              </tr>
            ) : (
              filteredList.map((item: any, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{item.student_id || '—'}</td>
                  <td className="px-4 py-3">{item.course || '—'}</td>
                  <td className="px-4 py-3">{item.preferred_hostel || '—'}</td>
                  <td className="px-4 py-3">{item.preferred_room_type || '—'}</td>
                  <td className="px-4 py-3">{item.applied_on ? new Date(item.applied_on).toLocaleDateString() : '—'}</td>
                  {isAdmin && <td className="px-4 py-3"></td>}
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
            <h3 className="text-sm font-semibold mb-5">{isAdmin ? "Add to Waiting List" : "Apply for Hostel Accommodation"}</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModal(false); }}>
              {isAdmin && (
                <div>
                  <label className="block text-xs font-medium mb-1.5">Student ID</label>
                  <input type="text" placeholder="STU2024XXX" className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5">Preferred Hostel</label>
                <select className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors">
                  <option>Any</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Room Type Preference</label>
                <select className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors">
                  <option>Single</option>
                  <option>Double Sharing</option>
                  <option>Triple Sharing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">AC Preference</label>
                <select className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors">
                  <option>No Preference</option>
                  <option>AC</option>
                  <option>Non-AC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Additional Notes</label>
                <textarea rows={2} placeholder="Any special requirements…" className="w-full px-3 py-2 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="h-9 px-4 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 transition-all" style={{ backgroundColor: "hsl(var(--primary))" }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
