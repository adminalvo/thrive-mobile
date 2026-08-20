import { useState, useEffect } from "react";
import styles from "./StudentRegistrationModal.module.css";
import { X, Check } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function StudentRegistrationModal({ onClose, onSuccess }: Props) {
  const [programsList, setProgramsList] = useState<any[]>([]);
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

  useEffect(() => {
    fetch("/api/programs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProgramsList(data);
        }
      })
      .catch(console.error);
  }, []);

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
                {programsList.map(prog => (
                  <label key={prog.id} className={`${styles.programCard} ${formData.programs.includes(prog.name) ? styles.programActive : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.programs.includes(prog.name)}
                      onChange={() => handleProgramToggle(prog.name)}
                      style={{ display: 'none' }}
                    />
                    <div className={styles.checkboxIcon}>
                      {formData.programs.includes(prog.name) && <Check size={16} />}
                    </div>
                    <span>{prog.name}</span>
                  </label>
                ))}
                {programsList.length === 0 && <p style={{color: 'var(--text-muted)'}}>Heç bir proqram tapılmadı.</p>}
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
