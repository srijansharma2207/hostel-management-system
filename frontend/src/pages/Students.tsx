import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { UserPlus, Search, Filter } from "lucide-react";

export default function Students() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/students")
      .then(res => res.json())
      .then(data => setStudents(data))
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
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
          <UserPlus className="w-3.5 h-3.5" />
          Add Student
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {["Student ID", "Name", "Course & Year", "Room / Block", "Hostel", "Status", ""].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground px-4 py-3 first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                  Loading students...
                </td>
              </tr>
            ) : (
              students.map((s: any) => (
                <tr key={s.id} className="border-b border-border">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.branch} - Year {s.year}</td>
                  <td className="px-4 py-3">{s.room}</td>
                  <td className="px-4 py-3">{s.block}</td>
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
