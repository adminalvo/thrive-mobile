import { useState } from "react";
import styles from "./StudentRegistrationModal.module.css";
import { X, Check } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

// Available programs mapping or options. You could fetch this from DB, but keeping it hardcoded if it was hardcoded before.
const PROGRAM_OPTIONS = [
  "English Language",
  "Russian Language",
  "General Math",
  "IT & Programming",
  "Design & Arts",
  "Pre-School"
];

export default function StudentRegistrationModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    // Student Details
    name: "",
    phone: "",
    email: "",
    password: "",

    // Parent Details
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentPassword: "",

    // Program Details
    programs: [] as string[]
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProgramToggle = (programName: string) => {
    setFormData(prev => {
      const current = prev.programs;
      if (current.includes(programName)) {
        return { ...prev, programs: current.filter(p => p !== programName) };
      } else {
        return { ...prev, programs: [...current, programName] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.programs.length === 0) {
      return toast.error("Zəhmət olmasa ən azı bir proqram seçin");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success("Tələbə uğurla əlavə edildi!");
        onSuccess();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Tələbə əlavə edilərkən xəta baş verdi");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Yeni Tələbə Qeydiyyatı</h2>
          <button type="button" className={styles.closeModalBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollArea}>
            
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Tələbə məlumatları</h3>
              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label>Ad, Soyad</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Telefon</label>
                  <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>E-poçt (istəyə bağlı)</label>
                  <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Sistemə Giriş Şifrəsi</label>
                  <input type="text" value={formData.password} onChange={e => handleChange('password', e.target.value)} placeholder="Avtomatik: 123456" />
                </div>
              </div>
            </div>

            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Valideyn məlumatları</h3>
              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label>Ad, Soyad</label>
                  <input type="text" value={formData.parentName} onChange={e => handleChange('parentName', e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Telefon</label>
                  <input type="text" value={formData.parentPhone} onChange={e => handleChange('parentPhone', e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>E-poçt (istəyə bağlı)</label>
                  <input type="email" value={formData.parentEmail} onChange={e => handleChange('parentEmail', e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Sistemə Giriş Şifrəsi</label>
                  <input type="text" value={formData.parentPassword} onChange={e => handleChange('parentPassword', e.target.value)} placeholder="Avtomatik: 123456" />
                </div>
              </div>
            </div>

            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Proqram Seçimi</h3>
              <p className={styles.sectionSubtitle}>Birdən çox proqram seçə bilərsiniz</p>
              
              <div className={styles.programGrid}>
                {PROGRAM_OPTIONS.map(prog => (
                  <label key={prog} className={`${styles.programCard} ${formData.programs.includes(prog) ? styles.programActive : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.programs.includes(prog)}
                      onChange={() => handleProgramToggle(prog)}
                      style={{ display: 'none' }}
                    />
                    <div className={styles.checkboxIcon}>
                      {formData.programs.includes(prog) && <Check size={16} />}
                    </div>
                    <span>{prog}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Ləğv et</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Yüklənir..." : "Tələbəni Qeyd Et"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
