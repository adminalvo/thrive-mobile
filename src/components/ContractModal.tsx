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
  const t = useTranslations("Contract");
  const c = useTranslations("Common");
  const componentRef = useRef<HTMLDivElement>(null);
  const sigCanvas = useRef<any>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Print function hook
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Muqavile_${invoice.student?.name?.replace(/\s+/g, '_') || 'Faktura'}`,
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
          <h2>{t("title")}</h2>
          <div className={styles.actions}>
            <button className={styles.printBtn} onClick={() => handlePrint()}>
              <Printer size={18} /> {t("printPdf")}
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className={styles.scrollArea}>
          <div className={styles.printWrapper} ref={componentRef}>
            <div className={styles.document}>
              
              <div className={styles.docHeader}>
                <div className={styles.brand}>
                  <h1>Thrive CRM</h1>
                  <p>{t("desc")}</p>
                </div>
                <div className={styles.docInfo}>
                  <h2>{t("invoiceNo")} #{invoice.id?.substring(0, 8).toUpperCase() || "INV-001"}</h2>
                  <p>{t("date")}: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              <div className={styles.docContent}>
                <h3>{t("parties")}</h3>
                <p>
                  <strong>{t("provider")}:</strong> Thrive Education Center<br />
                  <strong>{t("client")}:</strong> {invoice.student?.name || "Ad Soyad"}<br />
                  <strong>{t("contact")}:</strong> {invoice.student?.phone || c("notSpecified")}
                </p>

                <h3>{t("details")}</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("service")}</th>
                      <th>{t("status")}</th>
                      <th>{t("amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{t("serviceName")}</td>
                      <td>{invoice.status === "PAID" ? c("active") : c("pending")}</td>
                      <td>{invoice.amount} ₼</td>
                    </tr>
                  </tbody>
                </table>
                <div className={styles.totalArea}>
                  <strong>{t("total")}: {invoice.amount} ₼</strong>
                </div>

                <div className={styles.terms}>
                  <h3>{t("terms")}</h3>
                  <p>{t("term1")}</p>
                  <p>{t("term2")}</p>
                  <p>{t("term3")}</p>
                </div>
              </div>

              {/* Signature Block for Print */}
              <div className={styles.signatureBlock}>
                <div className={styles.signBox}>
                  <p>{t("signatureProvider")}:</p>
                  <div className={styles.stamp}>Thrive CRM</div>
                </div>
                <div className={styles.signBox}>
                  <p>{t("signatureClient")}:</p>
                  {signatureData ? (
                    <img src={signatureData} alt="Signature" className={styles.savedSignature} />
                  ) : (
                    <div className={styles.signPlaceholder}>{t("notSigned")}</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Interactive Signature Canvas (Not printed, used for drawing) */}
        <div className={styles.digitalSignatureArea}>
          <div className={styles.canvasHeader}>
            <span>{t("digitalSignature")}</span>
            <button className={styles.clearBtn} onClick={clearSignature}>
              <Eraser size={16} /> {t("clear")}
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
