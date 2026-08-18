import { useState } from "react";
import styles from "./StudentRegistrationModal.module.css";
import { X } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function StudentRegistrationModal({ onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    // Parent Details
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentFin: "",
    parentIdCard: "",
    parentPassword: "",
    parentAddress: "",

    // Student Details
    name: "",
    phone: "",
    email: "",
    password: "",
    studentDob: "",
    fin: "",
    idCard: "",
    studentAddress: "",

    // Program Details
    program: "",
    programFormat: "Əyani",
    programAddress: "",
    startDate: "",
    endDate: "",
    totalLessons: "",
    lessonDuration: "",
    lessonDays: "",
    mainTeacher: "",
    certificateCondition: "",

    // Payment Details
    monthlyPayment: "",
    durationMonths: "",
    initialPayment: "",
    initialPaymentDate: "",
    paymentDay: "",
    specialConditions: "",

    // Consents
    photoConsent: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      contractDetails: {
        programFormat: formData.programFormat,
        programAddress: formData.programAddress,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalLessons: formData.totalLessons,
        lessonDuration: formData.lessonDuration,
        lessonDays: formData.lessonDays,
        mainTeacher: formData.mainTeacher,
        certificateCondition: formData.certificateCondition,
        initialPayment: formData.initialPayment,
        initialPaymentDate: formData.initialPaymentDate,
        paymentDay: formData.paymentDay,
        specialConditions: formData.specialConditions,
        photoConsent: formData.photoConsent,
      }
    };

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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

        <div className={styles.tabsContainer}>
          <button type="button" className={`${styles.tabBtn} ${activeTab === 1 ? styles.activeTab : ''}`} onClick={() => setActiveTab(1)}>Sifarişçi</button>
          <button type="button" className={`${styles.tabBtn} ${activeTab === 2 ? styles.activeTab : ''}`} onClick={() => setActiveTab(2)}>Tələbə</button>
          <button type="button" className={`${styles.tabBtn} ${activeTab === 3 ? styles.activeTab : ''}`} onClick={() => setActiveTab(3)}>Proqram</button>
          <button type="button" className={`${styles.tabBtn} ${activeTab === 4 ? styles.activeTab : ''}`} onClick={() => setActiveTab(4)}>Ödəniş & İcazə</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollArea}>
            {activeTab === 1 && (
              <div className={styles.tabContent}>
                <h3>Sifarişçi / Valideyn məlumatları</h3>
                <div className={styles.grid}>
                  <div className={styles.inputGroup}>
                    <label>Ad, Soyad, Ata adı</label>
                    <input type="text" value={formData.parentName} onChange={e => handleChange('parentName', e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>FİN kod</label>
                    <input type="text" value={formData.parentFin} onChange={e => handleChange('parentFin', e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Ş/V nömrəsi</label>
                    <input type="text" value={formData.parentIdCard} onChange={e => handleChange('parentIdCard', e.target.value)} required />
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
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Ünvan</label>
                    <input type="text" value={formData.parentAddress} onChange={e => handleChange('parentAddress', e.target.value)} required />
                  </div>
                </div>
                <div className={styles.nextBtnContainer}>
                  <button type="button" className={styles.nextBtn} onClick={() => setActiveTab(2)}>Növbəti addım</button>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className={styles.tabContent}>
                <h3>Tələbə məlumatları</h3>
                <div className={styles.grid}>
                  <div className={styles.inputGroup}>
                    <label>Ad, Soyad, Ata adı</label>
                    <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Doğum tarixi</label>
                    <input type="date" value={formData.studentDob} onChange={e => handleChange('studentDob', e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>FİN kod (olduqda)</label>
                    <input type="text" value={formData.fin} onChange={e => handleChange('fin', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Ş/V nömrəsi (olduqda)</label>
                    <input type="text" value={formData.idCard} onChange={e => handleChange('idCard', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Telefon (olduqda)</label>
                    <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
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
                <div className={styles.nextBtnContainer}>
                  <button type="button" className={styles.prevBtn} onClick={() => setActiveTab(1)}>Geri</button>
                  <button type="button" className={styles.nextBtn} onClick={() => setActiveTab(3)}>Növbəti addım</button>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className={styles.tabContent}>
                <h3>Təhsil proqramı məlumatları (Əlavə 1)</h3>
                <div className={styles.grid}>
                  <div className={styles.inputGroup}>
                    <label>Proqramın adı</label>
                    <input type="text" value={formData.program} onChange={e => handleChange('program', e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Tədris formatı</label>
                    <select value={formData.programFormat} onChange={e => handleChange('programFormat', e.target.value)}>
                      <option value="Əyani">Əyani</option>
                      <option value="Onlayn">Onlayn</option>
                      <option value="Hibrid">Hibrid</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Keçirilmə ünvanı / platforma</label>
                    <input type="text" value={formData.programAddress} onChange={e => handleChange('programAddress', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Başlama tarixi</label>
                    <input type="date" value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Bitmə tarixi</label>
                    <input type="date" value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Ümumi dərs sayı</label>
                    <input type="text" value={formData.totalLessons} onChange={e => handleChange('totalLessons', e.target.value)} placeholder="Məs: 24 dərs" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Bir dərsin müddəti</label>
                    <input type="text" value={formData.lessonDuration} onChange={e => handleChange('lessonDuration', e.target.value)} placeholder="Məs: 90 dəqiqə" />
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Dərs günləri və saatları</label>
                    <input type="text" value={formData.lessonDays} onChange={e => handleChange('lessonDays', e.target.value)} placeholder="Məs: Bazar ertəsi, Çərşənbə (18:00 - 19:30)" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Əsas müəllim</label>
                    <input type="text" value={formData.mainTeacher} onChange={e => handleChange('mainTeacher', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Sertifikat şərti</label>
                    <input type="text" value={formData.certificateCondition} onChange={e => handleChange('certificateCondition', e.target.value)} placeholder="Məs: Yekun imtahanda 70% nəticə" />
                  </div>
                </div>
                <div className={styles.nextBtnContainer}>
                  <button type="button" className={styles.prevBtn} onClick={() => setActiveTab(2)}>Geri</button>
                  <button type="button" className={styles.nextBtn} onClick={() => setActiveTab(4)}>Növbəti addım</button>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className={styles.tabContent}>
                <h3>Ödəniş və Razılıq məlumatları</h3>
                <div className={styles.grid}>
                  <div className={styles.inputGroup}>
                    <label>Aylıq ödəniş məbləği (AZN)</label>
                    <input type="number" value={formData.monthlyPayment} onChange={e => handleChange('monthlyPayment', e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Müddət (Ay)</label>
                    <input type="number" value={formData.durationMonths} onChange={e => handleChange('durationMonths', e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>İlkin ödəniş (AZN)</label>
                    <input type="number" value={formData.initialPayment} onChange={e => handleChange('initialPayment', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>İlkin ödəniş tarixi</label>
                    <input type="date" value={formData.initialPaymentDate} onChange={e => handleChange('initialPaymentDate', e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Ödəniş günü (Hər ayın ... tarixi)</label>
                    <input type="number" value={formData.paymentDay} onChange={e => handleChange('paymentDay', e.target.value)} placeholder="Məs: 5" />
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Xüsusi şərtlər</label>
                    <input type="text" value={formData.specialConditions} onChange={e => handleChange('specialConditions', e.target.value)} placeholder="Əlavə qeydlər..." />
                  </div>
                </div>
                
                <h3 style={{ marginTop: '1.5rem' }}>Foto/video razılığı</h3>
                <div className={styles.checkboxGroup}>
                  <input 
                    type="checkbox" 
                    id="photoConsent" 
                    checked={formData.photoConsent} 
                    onChange={e => handleChange('photoConsent', e.target.checked)} 
                  />
                  <label htmlFor="photoConsent">
                    Foto/video və digər məlumatların reklam və ictimai paylaşım üçün istifadəsinə razılıq verirəm
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.prevBtn} onClick={() => setActiveTab(3)}>Geri</button>
                  <button type="submit" className={styles.saveBtn} disabled={loading}>
                    {loading ? "Gözləyin..." : "Müqaviləni yarat və yadda saxla"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
