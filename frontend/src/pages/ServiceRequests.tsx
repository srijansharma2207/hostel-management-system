import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Search } from "lucide-react";

export default function ServiceRequests() {
  const { isAdmin, user } = useAuth();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

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

  useEffect(() => {
    fetch("http://127.0.0.1:5000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setRooms([]));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/students")
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]));
  }, []);

  useEffect(() => {
    const sid = user?.studentId;
    const url = isAdmin
      ? "http://127.0.0.1:5000/service-requests"
      : sid
        ? `http://127.0.0.1:5000/service-requests?student_id=${encodeURIComponent(sid)}`
        : "http://127.0.0.1:5000/service-requests?student_id=";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((r: any) => {
          const rawId = r?.request_id ?? r?.service_request_id ?? r?.id;
          const rawType = r?.request_type ?? r?.type;
          const rawPriority = r?.priority;
          const rawStatus = r?.status;
          const rawDate = r?.created_at ?? r?.created_on ?? r?.request_date ?? r?.date_created;

          const studentId = r?.student_id;
          const studentRow =
            students.find((s: any) => String(s?.id) === String(studentId)) ??
            students.find((s: any) => String(s?.student_id) === String(studentId)) ??
            null;

          const backendRoomRaw = r?.room_no ?? r?.room_number;
          const backendBlockRaw = r?.block;
          const backendBlockNoRaw = r?.block_no;

          const roomKeyRaw = backendRoomRaw ?? r?.room_id ?? studentRow?.room;
          const roomKey = normalizeRoomNo(roomKeyRaw);

          const roomRow =
            rooms.find((rm: any) => String(rm?.room_id ?? "") === String(r?.room_id ?? "")) ??
            rooms.find(
              (rm: any) => normalizeRoomNo(rm?.room_no ?? rm?.room_number ?? rm?.room_num ?? rm?.room ?? "") === roomKey
            ) ??
            null;

          const fallbackBlock =
            studentRow?.block ??
            studentRow?.block_no ??
            roomRow?.hostel ??
            roomRow?.block ??
            roomRow?.hostel_id ??
            roomRow?.building ??
            "—";

          const blockBase = backendBlockRaw ?? backendBlockNoRaw ?? fallbackBlock;
          const block =
            blockBase != null && String(blockBase).trim() !== "" && blockBase !== "—"
              ? String(blockBase)
              : "—";

          const derivedBlockNo = backendBlockNoRaw ?? studentRow?.block_no;
          const blockLabel =
            backendBlockRaw != null && backendBlockRaw !== "" && backendBlockRaw !== "—"
              ? String(backendBlockRaw)
              : derivedBlockNo != null && derivedBlockNo !== "" && derivedBlockNo !== "—"
                ? `Block ${String(derivedBlockNo)}`
                : block;

          const roomNo =
            roomRow?.room_no ??
            roomRow?.room_number ??
            roomRow?.room_num ??
            roomRow?.room ??
            roomKeyRaw ??
            "—";

          return {
            id: rawId ?? "—",
            type: rawType ?? "—",
            student: studentId ?? "—",
            block: blockLabel,
            room: backendRoomRaw ?? roomNo,
            description: r?.description ?? "—",
            priority: rawPriority ?? "—",
            date: rawDate
              ? (() => {
                  const d = new Date(rawDate);
                  if (Number.isNaN(d.getTime())) return String(rawDate);
                  return d.toLocaleDateString();
                })()
              : "—",
            status: rawStatus ?? "—",
          };
        });
        setRequests(mapped);
      })
      .catch(() => setRequests([]));
  }, [isAdmin, user?.studentId, rooms, students]);

  const filteredRequests = useMemo(() => requests.filter((request: any) => 
    String(request.type ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(request.student ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(request.room ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(request.description ?? "").toLowerCase().includes(search.toLowerCase())
  ), [requests, search]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, inProgress: 0, resolved: 0 };
    requests.forEach((req: any) => {
      if (req.status === "Pending") counts.pending++;
      else if (req.status === "In Progress") counts.inProgress++;
      else if (req.status === "Resolved") counts.resolved++;
    });
    return counts;
  }, [requests]);

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
        {!isAdmin && (
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all ml-auto"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", count: statusCounts.pending },
            { label: "In Progress", count: statusCounts.inProgress },
            { label: "Resolved", count: statusCounts.resolved },
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
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                  {requests.length === 0 ? "No service requests yet. Connect a database to load data." : "No requests match your search."}
                </td>
              </tr>
            ) : (
              filteredRequests.map((request: any) => {
                const statusColor = request.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                  request.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                  "bg-green-100 text-green-700";
                
                return (
                  <tr key={request.id} className="border-b border-border">
                    <td className="px-4 py-3">{request.id}</td>
                    <td className="px-4 py-3">{request.type}</td>
                    <td className="px-4 py-3">
                      {isAdmin
                        ? `${request.student} / ${request.block}, ${request.room}`
                        : `${request.block}, ${request.room}`}
                    </td>
                    <td className="px-4 py-3">{request.description}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        request.priority === "High" ? "bg-red-100 text-red-700" :
                        request.priority === "Medium" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">{request.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColor}`}>
                        {request.status}
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
