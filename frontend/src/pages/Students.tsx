import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, Search, Filter } from "lucide-react";

export default function Students() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [students, setStudents] = useState([]);

  const [courseFilter, setCourseFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const courses = useMemo(() => {
    const set = new Set<string>();
    for (const s of students as any[]) {
      const c = String((s as any)?.branch ?? "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const s of students as any[]) {
      const yRaw = (s as any)?.year;
      if (yRaw === null || yRaw === undefined || yRaw === "") continue;
      set.add(String(yRaw));
    }
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();

    return (students as any[]).filter((student: any) => {
      const id = String(student.id ?? "");
      const name = String(student.name ?? "");
      const course = String(student.branch ?? "");
      const year = String(student.year ?? "");
      const roomRaw = String(student.room ?? "");
      const hostelRaw = String(student.block ?? "");
      const room = roomRaw === "—" ? "" : roomRaw;
      const hostelName = hostelRaw === "—" ? "" : hostelRaw;
      const blockNo = student?.block_no;
      const derivedBlockLabel = hostelName
        ? hostelName
        : blockNo === null || blockNo === undefined || String(blockNo).trim() === ""
          ? ""
          : `Block ${String(blockNo).trim()}`;

      const hostel = derivedBlockLabel;

      const hostelStatus = room && hostel ? "active" : "inactive";

      const matchesSearch =
        q === "" ||
        id.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        course.toLowerCase().includes(q) ||
        year.toLowerCase().includes(q) ||
        room.toLowerCase().includes(q) ||
        hostel.toLowerCase().includes(q);

      const matchesCourse = courseFilter === "" || course === courseFilter;
      const matchesYear = yearFilter === "" || year === yearFilter;
      const matchesStatus = statusFilter === "" || hostelStatus === statusFilter;

      return matchesSearch && matchesCourse && matchesYear && matchesStatus;
    });
  }, [students, search, courseFilter, yearFilter, statusFilter]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/students")
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  if (!isAdmin) {
    return (
      <div className="bg-card rounded-lg border border-border p-10 text-center shadow-sm animate-in fade-in duration-300">
        <p className="text-sm font-medium text-foreground mb-1">Total Students</p>
        <p className="text-5xl font-bold mb-2" style={{ color: "hsl(var(--primary))" }}>—</p>
        <p className="text-xs text-muted-foreground">Connect a database to display student count.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-xs outline-none focus:border-primary transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-card text-xs text-foreground outline-none focus:border-primary transition-colors"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-card text-xs text-foreground outline-none focus:border-primary transition-colors"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-card text-xs text-foreground outline-none focus:border-primary transition-colors"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setYearFilter("");
            setCourseFilter("");
          }}
          className="flex items-center gap-2 h-9 px-3 rounded-md border border-border text-xs text-muted-foreground hover:border-primary/40 transition-colors"
          title="Clear filters"
        >
          <Filter className="w-3.5 h-3.5" />
          Clear
        </button>

        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all ml-auto"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Student
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {["Student ID", "Name", "Registration Number", "Course", "Year", "Hostel Status", "Status", ""].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground px-4 py-3 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-xs text-muted-foreground">
                  {students.length === 0 ? "Loading students..." : "No students match your search."}
                </td>
              </tr>
            ) : (
              filteredStudents.map((s: any) => (
                <tr key={s.id} className="border-b border-border">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.id || '—'}</td>
                  <td className="px-4 py-3">{s.branch || '—'}</td>
                  <td className="px-4 py-3">{s.year ?? '—'}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const room = s.room === "—" ? "" : String(s.room ?? "").trim();
                      const blockName = s.block === "—" ? "" : String(s.block ?? "").trim();
                      const blockNo = s?.block_no;
                      const blockLabel = blockName
                        ? blockName
                        : blockNo === null || blockNo === undefined || String(blockNo).trim() === ""
                          ? ""
                          : `Block ${String(blockNo).trim()}`;

                      if (room && blockLabel) return `${room}, ${blockLabel}`;
                      if (room) return room;
                      if (blockLabel) return blockLabel;
                      return "Not Allocated";
                    })()}
                  </td>
                  <td className="px-4 py-3">Active</td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add New Student" onClose={() => setModal(false)}>
          <StudentForm onClose={() => setModal(false)} />
        </Modal>
      )}
    </div>
  );
}

function StudentForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    student_id: "",
    branch: "",
    year: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://127.0.0.1:5000/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year) || 1
        })
      });
      
      if (response.ok) {
        window.location.reload(); // Refresh to show new student
      } else {
        const error = await response.json();
        alert("Error: " + (error.error || "Failed to add student"));
      }
    } catch (error) {
      alert("Network error: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5">First Name</label>
          <input 
            type="text" 
            placeholder="e.g. Arjun"
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" 
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Last Name</label>
          <input 
            type="text" 
            placeholder="e.g. Sharma"
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" 
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Student ID</label>
          <input 
            type="text" 
            placeholder="e.g. STU2024001"
            value={formData.student_id}
            onChange={(e) => handleChange("student_id", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" 
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Course</label>
          <input 
            type="text" 
            placeholder="e.g. B.Tech CSE"
            value={formData.branch}
            onChange={(e) => handleChange("branch", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" 
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Year</label>
          <select 
            value={formData.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" 
            required
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Email</label>
          <input 
            type="email" 
            placeholder="student@hostel.edu"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" 
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1.5">Phone</label>
          <input 
            type="tel" 
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs outline-none focus:border-primary transition-colors" 
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="h-9 px-4 rounded-md text-xs font-medium text-white hover:opacity-90 transition-all disabled:opacity-50" style={{ backgroundColor: "hsl(var(--primary))" }}>
          {loading ? "Adding..." : "Add Student"}
        </button>
      </div>
    </form>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card rounded-lg border border-border shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-sm font-semibold mb-5">{title}</h3>
        {children}
      </div>
    </div>
  );
}
