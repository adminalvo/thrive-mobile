import { useRef, useState } from "react";
import styles from "./ContractModal.module.css";
import { X, Printer, Eraser } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import SignatureCanvas from "react-signature-canvas";
import { useTranslations } from "next-intl";

type ContractModalProps = {
  invoice: any;
  onClose: () => void;
};

export default function ContractModal({ invoice, onClose }: ContractModalProps) {
  const t = useTranslations("ContractLegal");
  const c = useTranslations("Common");
  const componentRef = useRef<HTMLDivElement>(null);
  const sigCanvas = useRef<any>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Fallback defaults
  const student = invoice?.student || {};
  const studentName = student.name || "Bilinmir";
  const idCard = student.idCard || "Qeyd edilməyib";
  const fin = student.fin || "Qeyd edilməyib";
  const phone = student.phone || "Qeyd edilməyib";
  const program = student.program || "Ümumi Proqram";
  const monthlyPayment = student.monthlyPayment || 0;
  const durationMonths = student.durationMonths || 1;
  const totalPrice = student.totalPrice || (monthlyPayment * durationMonths) || invoice.amount || 0;
  
  const contractNo = invoice?.id?.substring(0, 8).toUpperCase() || "000001";
  const dateStr = new Date(invoice?.createdAt || Date.now()).toLocaleDateString('az-AZ');
  const paymentDay = "05";

  // Print function hook
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Muqavile_${studentName.replace(/\s+/g, '_')}`,
  });

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
          <h2>{t("header", { contractNo: contractNo })}</h2>
          <div className={styles.actions}>
            <button className={styles.printBtn} onClick={() => handlePrint()}>
              <Printer size={18} /> Çap Et
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
                {t("header", { contractNo: contractNo })}
              </h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", fontWeight: "bold" }}>
                <span>{t("dateLocation", { date: dateStr })}</span>
              </div>

              <p style={{ textIndent: "30px", textAlign: "justify", marginBottom: "1.5rem" }}>
                {t("intro", { studentName, idCard, fin })}
              </p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>{t("s1_title")}</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>
                {t("s1_1", { program })}
              </p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>{t("s2_title")}</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.2rem" }}>{t("s2_1", { totalPrice })}</p>
              <p style={{ textAlign: "justify", marginBottom: "0.2rem" }}>{t("s2_2", { monthlyPayment, durationMonths })}</p>
              <p style={{ textAlign: "justify", marginBottom: "0.2rem" }}>{t("s2_3", { paymentDay })}</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>{t("s2_4")}</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>{t("s3_title")}</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>{t("s3_1", { program })}</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>{t("s3_2", { program })}</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>{t("s5_title")}</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>{t("s5_1")}</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>{t("s6_title")}</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>{t("s6_1")}</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>{t("s8_title")}</h4>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>{t("s8_1")}</p>

              <h4 style={{ textDecoration: "underline", marginBottom: "0.5rem" }}>{t("s9_title")}</h4>
              <p style={{ textAlign: "justify", marginBottom: "2rem" }}>{t("s9_1")}</p>

              <h3 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "1.5rem" }}>
                {t("parties")}
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                
                {/* Executor Box */}
                <div style={{ width: "45%" }}>
                  <h4 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "1rem" }}>{t("executor")}</h4>
                  <p style={{ whiteSpace: "pre-line", marginBottom: "1.5rem" }}>
                    {t("executorDetails")}
                  </p>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "0.5rem" }}>
                    <p style={{ whiteSpace: "pre-line", textAlign: "center" }}>{t("director")}</p>
                  </div>
                </div>

                {/* Student Box */}
                <div style={{ width: "45%" }}>
                  <h4 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "1rem" }}>{t("student")}</h4>
                  <p style={{ whiteSpace: "pre-line", marginBottom: "1.5rem" }}>
                    {t("studentDetails", { studentName, idCard, fin, phone })}
                  </p>
                  
                  <div style={{ borderTop: "1px solid #000", paddingTop: "0.5rem", minHeight: "80px" }}>
                    <p style={{ textAlign: "center" }}>
                      {signatureData ? (
                        <img src={signatureData} alt="Signature" style={{ maxHeight: "60px", margin: "0 auto" }} />
                      ) : (
                        t("parent")
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
