import { useRef } from "react";
import styles from "./ContractModal.module.css";
import { X, Download } from "lucide-react";
import html2pdf from "html2pdf.js";

type ContractModalProps = {
  invoice: any;
  onClose: () => void;
};

export default function ContractModal({ invoice, onClose }: ContractModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  // Fallback defaults
  const student = invoice?.student || {};
  const parentName = student.parentName || student.name || "Bilinmir";
  const parentPhone = student.parentPhone || student.phone || "Qeyd edilməyib";
  const fin = student.fin || "Qeyd edilməyib";
  const idCard = student.idCard || "Qeyd edilməyib";
  
  const program = student.program || "Ümumi Proqram";
  const monthlyPayment = student.monthlyPayment || 0;
  const durationMonths = student.durationMonths || 1;
  const totalPrice = student.totalPrice || (monthlyPayment * durationMonths) || invoice.amount || 0;
  
  const contractNo = invoice?.id?.substring(0, 8).toUpperCase() || "000001";
  const dateStr = new Date(invoice?.createdAt || Date.now()).toLocaleDateString('az-AZ');
  const paymentDay = "05";

  const handleDownloadPdf = () => {
    const element = componentRef.current;
    if (!element) return;
    
    // We clone it to avoid messing up the display while capturing, but html2pdf handles it okay.
    const opt = {
      margin:       15,
      filename:     `Muqavile_${parentName.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Actions */}
        <div className={styles.modalHeader}>
          <h2>Tədris Xidmətləri Müqaviləsi № {contractNo}</h2>
          <div className={styles.actions}>
            <button className={styles.printBtn} onClick={handleDownloadPdf}>
              <Download size={18} /> PDF Yüklə
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className={styles.scrollArea}>
          <div className={styles.printWrapper} ref={componentRef}>
            <div className={styles.document} style={{ color: "#000", fontFamily: "Times New Roman, serif", fontSize: "14px", lineHeight: "1.6" }}>
              
              <h2 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "16px", textDecoration: "underline" }}>
                Tədris Xidmətləri Müqaviləsi № {contractNo}
              </h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontWeight: "bold" }}>
                <span>Bakı ş.</span>
                <span>{dateStr}-cü il</span>
              </div>

              <p style={{ textIndent: "20px", textAlign: "justify", marginBottom: "0.75rem" }}>
                Bu Müqavilə (bundan sonra “Müqavilə”), bir tərəfdən Azərbaycan Respublikasında 
                müvafiq qaydada qeydiyyatdan keçmiş, Direktoru Məmmədov Tamerlanın şəxsində təmsil edilən, 
                “Thrive” MMC (bundan sonra “İcraçı” adlandırılacaq), və diqər tərəfdən 
                {parentName} (ş/v № {idCard}, FİN: {fin}) (bundan sonra “Tələbə” adlandırılacaq) 
                arasında, aşağıdakı şərtlər əsasında bağlanıldı. Müqavilənin məzmunundan başqa məna 
                hasil olmazsa, İcraçı və Tələbə bundan sonra ayrılıqda «Tərəf», birlikdə «Tərəflər» adlandırılacaq.
              </p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.25rem", fontSize: "14px" }}>1. Müqavilənin predmeti.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.75rem" }}>
                1.1. İcraçı "{program}" proqramı üzrə (bundan sonra "Proqram") Tələbəyə tədris xidmətlərini (bundan sonra "Xidmətlər") əyani/onlayn şəkilində göstərməyi, Tələbə isə xidmətləri qəbul edib onların Müqavilə üzrə razılaşdırılmış qiymətini İcraçıya ödəməyi öhdəsinə götürür.
              </p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.25rem", fontSize: "14px" }}>2. Xidmət haqqı və hesablaşma qaydası.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.1rem" }}>2.1. Müqavilə üzrə ümumi xidmət haqqı {totalPrice} AZN təşkil edir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.1rem" }}>2.2. Aylıq ödəniş: {monthlyPayment} AZN. Tələbə xidmət haqqını {durationMonths} ay müddətində hər ay ödəyir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.1rem" }}>2.3. Hər ay üzrə ödəniş ən gec ayın {paymentDay}-dək həyata keçirilməlidir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.75rem" }}>2.4. Tərəflər arasında hesablaşmalar nağd və ya nağdsız qaydada həyata keçirilir.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.25rem", fontSize: "14px" }}>3. Tərəflərin Hüquq və Öhdəlikləri.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.25rem" }}>3.1. Tələbənin öhdəlikləri: "{program}" proqramı üzrə dərslərdə iştirak etmək; fors-major hallarda İcraçıya qabaqcadan xəbər verməklə 1 dəfə dərsi buraxa bilər.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.75rem" }}>3.2. İcraçının öhdəlikləri: Tələbəni Proqrama uyğun tədris xidmətləri ilə təmin etmək; dərslərin vaxtında keçirilməsini təmin etmək.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.25rem", fontSize: "14px" }}>4. Kommersiya Sirri rejiminin müəyyən edilməsi.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.75rem" }}>4.1. Müqavilənin şərtləri kommersiya sirri hesab edilir və Tələbə tərəfindən gizli saxlanılır.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.25rem", fontSize: "14px" }}>5. Mübahisələrin həlli.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.75rem" }}>5.1. Mübahisələr danışıqlar yolu ilə, həll olunmadığı təqdirdə qanunvericilik əsasında məhkəmə qaydasında həll edilir.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.25rem", fontSize: "14px" }}>6. Fors-Major.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.75rem" }}>6.1. Qarşısıalınmaz qüvvə (fors-major) baş verdiyi təqdirdə Tərəflər məsuliyyət daşımırlar.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.25rem", fontSize: "14px" }}>7. Yekun müddəalar.</h4>
              <p style={{ textAlign: "justify", marginBottom: "1.5rem" }}>7.1. Müqavilə Azərbaycan dilində, 2 (iki) nüsxədə tərtib edilmişdir.</p>

              <h3 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "1rem", fontSize: "16px" }}>
                Tərəflər
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                
                {/* Executor Box */}
                <div style={{ width: "45%" }}>
                  <h4 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "0.5rem", fontSize: "14px" }}>İCRAÇI</h4>
                  <p style={{ whiteSpace: "pre-line", marginBottom: "1rem" }}>
                    "Thrive" MMC<br/>
                    Ünvan: Bakı ş., Nizami 6A<br/>
                    VÖEN: 2008351441<br/>
                    Tel.: +994 50 123 45 67
                  </p>
                  
                  <div style={{ borderTop: "1px solid #000", paddingTop: "0.5rem", minHeight: "60px" }}>
                    <p style={{ textAlign: "center" }}>Məmmədov Tamerlan</p>
                  </div>
                </div>

                {/* Student Box */}
                <div style={{ width: "45%" }}>
                  <h4 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "0.5rem", fontSize: "14px" }}>TƏLƏBƏ</h4>
                  <p style={{ whiteSpace: "pre-line", marginBottom: "1rem" }}>
                    {parentName}<br/>
                    Ş/v №: {idCard}<br/>
                    FİN: {fin}<br/>
                    Tel.: {parentPhone}
                  </p>
                  
                  <div style={{ borderTop: "1px solid #000", paddingTop: "0.5rem", minHeight: "80px" }}>
                    <p style={{ textAlign: "center" }}>
                      Valideyn:
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
