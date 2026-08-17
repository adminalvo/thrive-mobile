import fs from 'fs';
const file = 'src/app/[locale]/dashboard/parents/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Users icon
content = content.replace('import { Plus, Search, Filter, MoreHorizontal, UserPlus, Trash2, X } from "lucide-react";', 
'import { Plus, Search, Filter, MoreHorizontal, UserPlus, Trash2, X, Users } from "lucide-react";');

// Add states for managing students
content = content.replace('const [activeMenu, setActiveMenu] = useState<string | null>(null);',
`const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");

  const fetchAllStudents = async () => {
    const res = await fetch("/api/students");
    if(res.ok) {
      const data = await res.json();
      setAllStudents(data);
    }
  };

  const fetchLinkedStudents = async (parentId: string) => {
    const res = await fetch(\`/api/parents/\${parentId}/students\`);
    if(res.ok) {
      const data = await res.json();
      setLinkedStudents(data);
    }
  };

  const openStudentsModal = (parentId: string) => {
    setSelectedParentId(parentId);
    fetchAllStudents();
    fetchLinkedStudents(parentId);
    setShowStudentsModal(true);
  };

  const linkStudent = async () => {
    if(!selectedStudentToAdd || !selectedParentId) return;
    try {
      const res = await fetch(\`/api/parents/\${selectedParentId}/students\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: selectedStudentToAdd })
      });
      if(res.ok) {
        toast.success("Tələbə uğurla əlavə edildi");
        fetchLinkedStudents(selectedParentId);
        setSelectedStudentToAdd("");
      } else toast.error("Xəta baş verdi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const unlinkStudent = async (studentId: string) => {
    if(!selectedParentId) return;
    try {
      const res = await fetch(\`/api/parents/\${selectedParentId}/students?student_id=\${studentId}\`, {
        method: "DELETE"
      });
      if(res.ok) {
        toast.success("Tələbə silindi");
        fetchLinkedStudents(selectedParentId);
      } else toast.error("Xəta baş verdi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };
`);

// Add students modal at the end before last div
content = content.replace('      {/* Create Modal */}', 
`      {/* Students Manage Modal */}
      {showStudentsModal && selectedParentId && (
        <div className={styles.modalOverlay} onClick={() => setShowStudentsModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Övladları (Tələbələri) İdarə Et</h2>
              <button className={styles.closeBtn} onClick={() => setShowStudentsModal(false)}><X size={20}/></button>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <h4>Mövcud Övladlar:</h4>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                {linkedStudents.length === 0 ? <li style={{color: "#6b7280"}}>Heç bir tələbə yoxdur.</li> : linkedStudents.map(ls => (
                  <li key={ls.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#f3f4f6", marginBottom: "8px", borderRadius: "6px" }}>
                    <span>{ls.name}</span>
                    <button onClick={() => unlinkStudent(ls.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16}/></button>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select value={selectedStudentToAdd} onChange={e => setSelectedStudentToAdd(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <option value="">Tələbə Seçin...</option>
                {allStudents.filter(s => !linkedStudents.some(ls => ls.id === s.id)).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button onClick={linkStudent} style={{ padding: "10px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Əlavə Et</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}`);

// Add menu action
content = content.replace('<button onClick={() => handleDelete(p.id)} className={styles.menuItem} style={{ color: "#ef4444" }}>', 
`<button onClick={() => { openStudentsModal(p.id); setActiveMenu(null); }} className={styles.menuItem}>
                            <Users size={16} />
                            Övladları (Tələbələri)
                          </button>
                          <button onClick={() => handleDelete(p.id)} className={styles.menuItem} style={{ color: "#ef4444" }}>`);

fs.writeFileSync(file, content);
console.log("Parents updated");
