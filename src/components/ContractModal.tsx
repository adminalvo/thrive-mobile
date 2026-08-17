import { useRef, useState } from "react";
import styles from "./ContractModal.module.css";
import { X, Download, Eraser } from "lucide-react";
import html2pdf from "html2pdf.js";
import SignatureCanvas from "react-signature-canvas";

type ContractModalProps = {
  invoice: any;
  onClose: () => void;
};

export default function ContractModal({ invoice, onClose }: ContractModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const sigCanvas = useRef<any>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

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

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData(null);
  };

  const saveSignature = () => {
    if (sigCanvas.current?.isEmpty()) {
      setSignatureData(null);
    } else {
      setSignatureData(sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png"));
    }
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
              
              <h2 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "18px", textDecoration: "underline" }}>
                Tədris Xidmətləri Müqaviləsi № {contractNo}
              </h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", fontWeight: "bold" }}>
                <span>Bakı ş. {dateStr}-cü il</span>
              </div>

              <p style={{ textIndent: "30px", textAlign: "justify", marginBottom: "1.5rem" }}>
                Bu Müqavilə (bundan sonra “Müqavilə”), bir tərəfdən Azərbaycan Respublikasında 
                müvafiq qaydada qeydiyyatdan keçmiş, Direktoru Məmmədov Tamerlanın şəxsində təmsil edilən, 
                “Thrive” MMC (bundan sonra “İcraçı” adlandırılacaq), və diqər tərəfdən 
                {parentName} (ş/v № {idCard}, FİN: {fin}) (bundan sonra “Tələbə” adlandırılacaq) 
                arasında, aşağıdakı şərtlər əsasında bağlanıldı. Müqavilənin məzmunundan başqa məna 
                hasil olmazsa, İcraçı və Sifarişçi bundan sonra ayrılıqda «Tərəf», birlikdə «Tərəflər» adlandırılacaq.
              </p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>1. Müqavilənin predmeti.</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>
                1.1. İcraçı "{program}" proqram/ları üzrə (bundan sonra "Proqram") Tələbəyə tədris xidmətlərini (bundan sonra "Xidmətlər") əyani/onlayn şəkilində Tələbəyə göstərməyi, Tələbə isə xidmətləri qəbul edib onların Müqavilə üzrə razılaşdırılmış qiymətini İcraçıya ödəməyi öhdəsinə götürür.
              </p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>2. Xidmət haqqı və hesablaşma qaydası.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.2rem" }}>2.1. Müqavilə üzrə ümumi xidmət haqqı {totalPrice} Azərbaycan Manatı təşkil edir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.2rem" }}>2.2. Müqavilə üzrə ödəniş aşağıdakı qaydada həyata keçirilir: Aylıq ödəniş: {monthlyPayment} Azərbaycan Manatı olmaqla; Tələbə xidmət haqqını {durationMonths} ay müddətində, hər ay {monthlyPayment} Azərbaycan Manatı olmaqla ödəyir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.2rem" }}>2.3. Hər ay üzrə ödəniş ən gec ayın {paymentDay} tarixinədək həyata keçirilməlidir.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>2.4. Müqavilə üzrə Tərəflər arasında bütün hesablaşmalar nağd və ya nağdsız qaydada, Azərbaycan manatı ilə həyata keçirilir.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>3. Tərəflərin Hüquq və Öhdəlikləri.</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>3.1. Tələbənin hüquq və öhdəlikləri: Müqavilədə göstərilmiş "{program}" proqram/ları üzrə dərslərdə iştirak etmək; Tələbə fors-major hallarda İcraçıya qabaqcadan xəbər vermək şərti ilə 1 dəfə dərsi buraxa bilər...</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>3.2. İcraçının hüquq və öhdəlikləri: Tələbəni Proqrama uyğun olaraq tədris xidmətləri ilə təmin edir; Proqrama uyğun olaraq dərslərin vaxtında keçirilməsini və texniki şəraitin yaradılmasını təmin edir...</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>4. Kommersiya Sirri rejiminin müəyyən edilməsi.</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>4.1. Müqavilənin şərtləri və icrası, kommersiya sirri hesab edilir və Tələbə tərəfindən gizli saxlanılır.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>5. Mübahisələrin həlli.</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>5.1. Mübahisələr danışıqlar yolu ilə, həll olunmadığı təqdirdə isə Azərbaycan Respublikasının qanunvericiliyi əsasında məhkəmə qaydasında həll edilir.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>6. Fors-Major.</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>6.1. Tərəflərin iradəsindən asılı olmayan qarşısıalınmaz qüvvə (fors-major) baş verdiyi təqdirdə Tərəflər məsuliyyət daşımırlar.</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>7. Yekun müddəalar.</h4>
              <p style={{ textAlign: "justify", marginBottom: "2rem" }}>7.1. Müqavilə Azərbaycan dilində, 2 (iki) nüsxədə tərtib edilmişdir.</p>

              <h3 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "1.5rem" }}>
                Tərəflər
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                
                {/* Executor Box */}
                <div style={{ width: "45%" }}>
                  <h4 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "1rem" }}>İCRAÇI</h4>
                  <p style={{ whiteSpace: "pre-line", marginBottom: "1.5rem" }}>
                    "Thrive" MMC<br/>
                    Ünvan: Bakı ş., Səbail rayonu, Nizami 6A küçəsi<br/>
                    VÖEN: 2008351441<br/>
                    Tel.: +994(99)446-60-00<br/>
                    Bank: "Kapital Bank" ASC<br/>
                    H/H: AZ59AIIB400900G9443981875110
                  </p>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "0.5rem" }}>
                    <p style={{ whiteSpace: "pre-line", textAlign: "center" }}>Tamerlan Məmmədov<br/>Direktor</p>
                  </div>
                </div>

                {/* Student Box */}
                <div style={{ width: "45%" }}>
                  <h4 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "1rem" }}>TƏLƏBƏ</h4>
                  <p style={{ whiteSpace: "pre-line", marginBottom: "1.5rem" }}>
                    {parentName}<br/>
                    Ş/v №: {idCard}<br/>
                    FİN: {fin}<br/>
                    Tel.: {parentPhone}
                  </p>
                  
                  <div style={{ borderTop: "1px solid #000", paddingTop: "0.5rem", minHeight: "80px" }}>
                    <p style={{ textAlign: "center" }}>
                      {signatureData ? (
                        <img src={signatureData} alt="Signature" style={{ maxHeight: "60px", margin: "0 auto" }} />
                      ) : (
                        "Valideyn:"
                      )}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Interactive Signature Canvas (Not printed, used for drawing) */}
        <div className={styles.digitalSignatureArea}>
          <div className={styles.canvasHeader}>
            <span>İmza (Valideyn)</span>
            <button className={styles.clearBtn} onClick={clearSignature}>
              <Eraser size={16} /> Sil
            </button>
          </div>
          <div className={styles.canvasWrapper} onMouseUp={saveSignature} onTouchEnd={saveSignature}>
            <SignatureCanvas 
              ref={sigCanvas} 
              penColor="white"
              canvasProps={{ className: styles.sigPad }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
