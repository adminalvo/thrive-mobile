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

  const student = invoice?.student || {};
  const contract = student.contractDetails || {};

  // Valideyn/Sifarişçi məlumatları
  const parentName = student.parentName || "________________";
  const parentFin = student.parentFin || "________________";
  const parentIdCard = student.parentIdCard || "________________";
  const parentAddress = student.parentAddress || "________________";
  const parentPhone = student.parentPhone || student.phone || "________________";
  const parentEmail = student.parentEmail || student.email || "________________";

  // Tələbə məlumatları
  const studentName = student.name || "________________";
  const studentDob = student.dob ? new Date(student.dob).toLocaleDateString('az-AZ') : "________________";
  const studentFin = student.fin || "________________";
  const studentIdCard = student.idCard || "________________";
  const studentPhone = student.phone || "________________";

  // Proqram
  const programName = contract.program || student.program || invoice.program || "________________";
  const programFormat = contract.programFormat || "________________";
  const programAddress = contract.programAddress || "________________";
  const startDate = contract.startDate ? new Date(contract.startDate).toLocaleDateString('az-AZ') : "________________";
  const endDate = contract.endDate ? new Date(contract.endDate).toLocaleDateString('az-AZ') : "________________";
  const totalLessons = contract.totalLessons || "________________";
  const lessonDuration = contract.lessonDuration || "________________";
  const lessonDays = contract.lessonDays || "________________";
  const mainTeacher = contract.mainTeacher || "________________";
  const certificateCondition = contract.certificateCondition || "________________";

  // Ödəniş
  const totalPrice = contract.totalPrice || student.totalPrice || invoice.amount || "________________";
  const monthlyPayment = contract.monthlyPayment || student.monthlyPayment || "________________";
  const initialPayment = contract.initialPayment || "________________";
  const initialPaymentDate = contract.initialPaymentDate ? new Date(contract.initialPaymentDate).toLocaleDateString('az-AZ') : "________________";
  const paymentDay = contract.paymentDay || "05";
  const specialConditions = contract.specialConditions || "________________";
  
  // İcazə
  const isPhotoConsent = contract.photoConsent !== false;

  const contractNo = invoice?.id?.substring(0, 8).toUpperCase() || "TM-0001";
  const dateStr = new Date(invoice?.createdAt || Date.now()).toLocaleDateString('az-AZ');

  const handleDownloadPdf = () => {
    const element = componentRef.current;
    if (!element) return;
    
    const opt = {
      margin:       [10, 15, 15, 15],
      filename:     `Tədris_Müqaviləsi_${studentName.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2>Tədris Xidmətləri Müqaviləsi</h2>
          <div className={styles.actions}>
            <button className={styles.printBtn} onClick={handleDownloadPdf}>
              <Download size={18} /> PDF Yüklə
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.printWrapper} ref={componentRef}>
            <div className={styles.document} style={{ color: "#000", fontFamily: "'Times New Roman', Times, serif", fontSize: "12pt", lineHeight: "1.5" }}>
              
              <h2 style={{ textAlign: "center", marginBottom: "0.25rem", fontSize: "14pt", fontWeight: "bold" }}>
                TƏDRİS XİDMƏTLƏRİ MÜQAVİLƏSİ
              </h2>
              <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: "bold", marginBottom: "1rem" }}>
                <div>“TM VENTURES” MMC</div>
                <div>THRIVE EDUCATION CENTER</div>
                <div>Bakı</div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span>Müqavilə № {contractNo}</span>
                <span>Bakı şəhəri</span>
              </div>
              <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
                Tarix: {dateStr}
              </div>

              <p style={{ textIndent: "20px", textAlign: "justify", marginBottom: "1rem" }}>
                Bu Müqavilə, bir tərəfdən Azərbaycan Respublikasının qanunvericiliyinə uyğun olaraq qeydiyyatdan keçmiş, 
                direktoru Məmmədov Tamerlan tərəfindən təmsil olunan “TM VENTURES” MMC (bundan sonra - “İcraçı”), digər tərəfdən 
                aşağıda məlumatları göstərilən valideyn, qanuni nümayəndə və ya təhsil xidmətlərini sifariş edən şəxs (bundan sonra - “Sifarişçi”) 
                arasında, aşağıda məlumatları göstərilən şəxsin (bundan sonra - “Tələbə”) təhsil alması məqsədilə bağlanır. 
                Sifarişçi və Tələbə eyni şəxs olduqda, Sifarişçiyə dair müddəalar Tələbəyə də şamil olunur. İcraçı və Sifarişçi ayrılıqda “Tərəf”, birlikdə “Tərəflər” adlandırılır.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "12pt", textDecoration: "underline", marginBottom: "0.5rem" }}>SİFARİŞÇİ / VALİDEYN</h3>
                  <div>Ad, soyad, ata adı: {parentName}</div>
                  <div>Ş/V №: {parentIdCard} | FİN: {parentFin}</div>
                  <div>Ünvan: {parentAddress}</div>
                  <div>Telefon: {parentPhone} | E-poçt: {parentEmail}</div>
                </div>
                <div>
                  <h3 style={{ fontSize: "12pt", textDecoration: "underline", marginBottom: "0.5rem" }}>TƏLƏBƏ</h3>
                  <div>Ad, soyad, ata adı: {studentName}</div>
                  <div>Doğum tarixi: {studentDob}</div>
                  <div>Ş/V № / FİN (olduqda): {studentIdCard} / {studentFin}</div>
                  <div>Telefon (olduqda): {studentPhone}</div>
                </div>
              </div>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>1. MÜQAVİLƏNİN PREDMETİ</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>1.1. İcraçı bu Müqavilənin ayrılmaz hissəsi olan Əlavə 1-də göstərilmiş proqram üzrə Tələbəyə tədris xidmətləri göstərməyi, Sifarişçi isə xidmətləri qəbul etməyi və haqqını bu Müqavilədə müəyyən edilmiş qaydada ödəməyi öhdəsinə götürür.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>1.2. Proqramın adı, formatı, keçirilmə yeri, müddəti, dərslərin sayı və davametmə müddəti, təxmini cədvəli, xidmət haqqı və digər xüsusi şərtlər Əlavə 1-də müəyyən edilir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>1.3. İcraçı proqramın məzmununun mahiyyəti qorunmaqla müəllimi, dərs otağını, istifadə edilən platformanı və cədvəli əsaslandırılmış hallarda dəyişə bilər. Belə dəyişiklik barədə Sifarişçiyə ağlabatan müddətdə rəsmi əlaqə kanallarından biri ilə məlumat verilir.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>1.4. Sertifikatın verilməsi nəzərdə tutulduqda, onun şərtləri Əlavə 1-də göstərilir. Müqavilə konkret işə qəbul, gəlir, imtahan nəticəsi və ya digər nəticəyə təminat vermir; nəticə Tələbənin davamiyyətindən və tapşırıqları yerinə yetirməsindən də asılıdır.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>2. XİDMƏT HAQQI VƏ HESABLAŞMA QAYDASI</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>2.1. Ümumi xidmət haqqı və ödəniş cədvəli Əlavə 1-də göstərilir. Bütün ödənişlər Azərbaycan manatı ilə nağd və ya İcraçının bank hesabına nağdsız qaydada həyata keçirilir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>2.2. Sifarişçi ödənişi Əlavə 1-də göstərilmiş tarixlərdə həyata keçirməlidir. Nağd ödəniş zamanı kassa çeki və ya qanunvericiliklə nəzərdə tutulan digər ödəniş sənədi təqdim edilir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>2.3. Ödənişin gecikdirildiyi hər gün üçün Sifarişçi gecikdirilmiş məbləğin 0,3 faizi həcmində dəbbə pulu ödəyir. Dəbbə pulunun ümumi məbləği gecikdirilmiş ödənişin 10 faizindən artıq ola bilməz.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>2.4. Ödəniş 5 təqvim günündən artıq gecikdirildikdə, İcraçı Sifarişçiyə əvvəlcədən məlumat verməklə borc ödənilənədək Tələbənin dərslərdə iştirakını müvəqqəti dayandıra bilər. Bu hal ödəniş öhdəliyini aradan qaldırmır.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>3. TƏLƏBƏNİN VƏ SİFARİŞÇİNİN HÜQUQ VƏ ÖHDƏLİKLƏRİ</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>3.1. Tələbə dərslərdə vaxtında iştirak etməli, proqramın tələblərinə, təhlükəsizlik və daxili intizam qaydalarına riayət etməli, tapşırıqları yerinə yetirməli və digər iştirakçıların tədris prosesinə mane olmamalıdır.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>3.2. Tələbə xəstəlik, ailə vəziyyəti və ya digər üzrlü səbəbə görə dərsdə iştirak edə bilmədikdə, imkan daxilində dərsdən əvvəl İcraçıya məlumat verməlidir. Proqram ərzində bir buraxılmış dərsin əvəzlənməsi İcraçının təşkilati imkanları daxilində həyata keçirilə bilər. Digər buraxılmış dərslərin əvəzlənməsi yalnız İcraçının razılığı ilə mümkündür.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>3.3. Tələbə dərsə gecikdikdə dərsin gedişinə mane olmamaq şərti ilə dərsə buraxıla bilər. Test və ya qiymətləndirmə başladıqdan sonra qoşulma imkanı məhdudlaşdırıla bilər.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>3.4. Tələbənin dərsdə iştirak etməməsi həmin dərs üzrə ödənişin qaytarılması üçün əsas deyil.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>3.5. Sifarişçi təqdim etdiyi məlumatların düzgünlüyünü təmin etməli, əlaqə məlumatları dəyişdikdə 3 iş günü ərzində İcraçıya məlumat verməli və ödənişləri vaxtında həyata keçirməlidir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>3.6. Tələbə İcraçının əmlakına təqsirli şəkildə zərər vurduqda, Sifarişçi sənədlə təsdiq edilmiş real zərəri qanunvericiliklə müəyyən edilən qaydada ödəyir.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>3.7. Daxili intizam qaydaları ciddi şəkildə və ya yazılı xəbərdarlıqdan sonra təkrarən pozulduqda, İcraçı Tələbəni dərslərdən kənarlaşdıra və Müqaviləyə birtərəfli qaydada xitam verə bilər. Bu halda ödənilmiş xidmət haqqı geri qaytarılmır.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>4. İCRAÇININ HÜQUQ VƏ ÖHDƏLİKLƏRİ</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>4.1. İcraçı Əlavə 1-ə uyğun tədris prosesini, müəllim və zəruri texniki şəraiti təşkil edir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>4.2. İcraçı dərs materiallarını və cədvəl dəyişikliklərini WhatsApp, elektron poçt və ya Tərəflərin razılaşdırdığı digər vasitə ilə çatdırır.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>4.3. İcraçı xidmətlərin göstərilməsinə müəllimləri və digər üçüncü şəxsləri cəlb edə bilər və onların fəaliyyəti üçün Sifarişçi qarşısında məsuliyyət daşıyır.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>4.4. İcraçının səbəbindən keçirilməyən dərs əvəzlənir. Proqram İcraçının səbəbindən dayandırıldıqda, keçirilməmiş xidmətlərə aid ödənilmiş məbləğ Sifarişçiyə qaytarılır.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>4.5. İcraçı Tələbənin sağlamlığı və təhlükəsizliyi ilə bağlı əvvəlcədən yazılı bildirilmiş və tədris prosesinə aid məlumatları təşkilati imkanlar və qanunvericilik çərçivəsində nəzərə alır.</p>

              <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>5. TƏLİMDƏN İMTİNA VƏ ÖDƏNİŞİN QAYTARILMASI</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>5.1. Tələbə qeydiyyatdan keçdikdən sonra proqramda iştirak etməkdən imtina etdikdə və hələ ilk dərsdə iştirak etmədikdə, ödənilmiş məbləğ tam şəkildə geri qaytarılır.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>5.2. Tələbə ən azı bir dərsdə iştirak etdikdən sonra proqramda iştirakdan imtina etdikdə və ya digər səbəbdən təlimi davam etdirmədikdə, ödənilmiş məbləğ geri qaytarılmır və Sifarişçi Müqavilə üzrə ödəniş öhdəliklərini tam şəkildə yerinə yetirməlidir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>5.3. Tədris İcraçının səbəbindən təşkil olunmadıqda və ya proqram dayandırıldıqda, keçirilməmiş xidmətlərə aid ödənilmiş məbləğ Sifarişçiyə geri qaytarılır.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>5.4. Geri qaytarılmalı məbləğ Sifarişçinin yazılı müraciəti və zəruri bank məlumatları İcraçıya təqdim edildikdən sonra 10 iş günü ərzində ödənilir.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>6. ƏQLİ MÜLKİYYƏT VƏ TƏDRİS MATERİALLARI</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>6.1. İcraçının təqdim etdiyi elektron və çap materialları, video, mühazirə, nümunə və tapşırıqlar yalnız Tələbənin şəxsi təhsil məqsədləri üçün istifadə edilə bilər.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>6.2. Materialların İcraçının yazılı razılığı olmadan üçüncü şəxslərə ötürülməsi, açıq platformalarda yayılması, çoxaldılması, satılması və ya kommersiya məqsədilə istifadəsi qadağandır.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>6.3. Bu tələblərin pozulması halında Sifarişçi İcraçıya vurulmuş və sənədlə təsdiq edilən real zərərin əvəzini qanunvericiliklə müəyyən edilmiş qaydada ödəyir.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>7. FƏRDİ MƏLUMATLAR VƏ FOTO/VİDEO İSTİFADƏSİ</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>7.1. İcraçı Sifarişçi və Tələbənin fərdi məlumatlarını Müqavilənin bağlanması və icrası, ödənişlərin uçotu, tədrisin təşkili, əlaqə və qanuni öhdəliklərin yerinə yetirilməsi məqsədilə emal edir və onların mühafizəsi üçün ağlabatan təşkilati və texniki tədbirlər görür.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>7.2. Fərdi məlumatlar yalnız qanuni əsas olduqda, xidmətin göstərilməsi üçün zəruri üçüncü şəxslərə və ya səlahiyyətli dövlət orqanlarına təqdim edilə bilər.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>7.3. Reklam və ictimai paylaşım məqsədilə Tələbənin fotoşəkli, videosu, imtahan nəticəsi və digər məlumatlarından istifadə yalnız aşağıdakı ayrıca razılıq əsasında mümkündür. Razılığın verilməməsi təhsil xidmətinin göstərilməsinə təsir etmir.</p>
              <div style={{ marginBottom: "1rem", fontWeight: "bold" }}>
                Foto/video icazəsi: {isPhotoConsent ? "Razıyam" : "Razı deyiləm"}
                <br/><br/>
                Sifarişçinin imzası: ____________________
              </div>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>8. MƏXFİLİK</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>8.1. Tərəflər Müqavilənin icrası zamanı əldə etdikləri məxfi məlumatları üçüncü şəxslərə açıqlamamalıdırlar.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>8.2. Açıq mənbədən əldə edilən, qanuni əsasla əvvəlcədən məlum olan, hüquq və mənafelərin müdafiəsi üçün hüquqşünasa, mühasibə və ya məhkəməyə təqdim edilən, yaxud qanunla açıqlanması tələb olunan məlumatlar məxfi məlumat hesab edilmir.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>9. MÜQAVİLƏNİN MÜDDƏTİ VƏ XİTAMI</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>9.1. Müqavilə Tərəflər tərəfindən imzalandığı tarixdən qüvvəyə minir və öhdəliklər tam yerinə yetirilənədək qüvvədə qalır.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>9.2. Müqaviləyə Tərəflərin yazılı razılığı ilə vaxtından əvvəl xitam verilə bilər.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>9.3. İcraçı ödənişin davamlı gecikdirilməsi, ciddi intizam pozuntusu, zorakılıq, təhqir, tədris prosesinə qəsdən mane olma və ya materialların qanunsuz yayılması hallarında Sifarişçiyə yazılı bildiriş göndərməklə Müqaviləyə birtərəfli qaydada xitam verə bilər.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>9.4. Müqaviləyə xitam verilməsi xitam tarixinədək yaranmış ödəniş, məsuliyyət, məxfilik və əqli mülkiyyət öhdəliklərini aradan qaldırmır.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>10. FORS-MAJOR</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>10.1. Tərəflərin nəzarətindən kənar, qabaqcadan ağlabatan qaydada nəzərdə tutulması və qarşısının alınması mümkün olmayan hadisələr nəticəsində öhdəliyin icra edilməməsinə görə Tərəf həmin halın təsir etdiyi həddə məsuliyyət daşımır.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>10.2. Fors-major halına istinad edən Tərəf digər Tərəfə imkan daxilində 5 iş günü ərzində məlumat verməli və hadisənin öhdəliyin icrasına təsirini göstərməlidir.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>10.3. Fors-major 30 təqvim günündən artıq davam etdikdə, hər bir Tərəf qarşılıqlı hesablaşma aparmaqla Müqaviləyə xitam verə bilər. Keçirilməmiş xidmətlər üçün ödənilmiş məbləğ qaytarılır.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>11. BİLDİRİŞLƏR VƏ MÜBAHİSƏLƏRİN HƏLLİ</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>11.1. Rəsmi bildirişlər bu Müqavilədə göstərilən telefon nömrəsinə WhatsApp mesajı, elektron poçt və ya kağız daşıyıcı ilə göndərilə bilər. Mesajın göndərilməsini təsdiq edən elektron qeyd bildirişin göndərilməsinə sübut hesab edilir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>11.2. Əlaqə məlumatlarını dəyişən Tərəf bu barədə digər Tərəfə 3 iş günü ərzində məlumat verməlidir. Əks halda əvvəlki rekvizitlərə göndərilmiş bildiriş lazımi qaydada göndərilmiş hesab olunur.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>11.3. Mübahisələr əvvəlcə danışıqlar və yazılı müraciət yolu ilə həll edilməyə çalışılır. Mübahisə yazılı müraciətin alınmasından 14 təqvim günü ərzində həll edilmədikdə, Azərbaycan Respublikasının qanunvericiliyinə uyğun olaraq məhkəmədə həll edilir.</p>

              <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>12. YEKUN MÜDDƏALAR</h4>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>12.1. Müqaviləyə dəyişiklik və əlavələr yazılı şəkildə rəsmiləşdirildikdə və Tərəflər tərəfindən imzalandıqda qüvvəyə minir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>12.2. Hər hansı müddəanın etibarsız hesab edilməsi digər müddəaların etibarlılığına təsir etmir.</p>
              <p style={{ textAlign: "justify", marginBottom: "0.5rem" }}>12.3. Müqavilə və Əlavə 1 birlikdə vahid sənəd təşkil edir. Ziddiyyət olduqda, konkret proqram və ödəniş şərtləri üzrə Əlavə 1 tətbiq edilir.</p>
              <p style={{ textAlign: "justify", marginBottom: "1rem" }}>12.4. Müqavilə Azərbaycan dilində, eyni hüquqi qüvvəyə malik iki nüsxədə tərtib olunur və hər Tərəfə bir nüsxə verilir.</p>


              <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>


              <h2 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "14pt", fontWeight: "bold" }}>
                ƏLAVƏ 1<br/>PROQRAM VƏ ÖDƏNİŞ ŞƏRTLƏRİ
              </h2>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold", width: "40%" }}>Proqramın adı</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{programName}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Tədris formatı</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{programFormat}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Keçirilmə ünvanı / platforma</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{programAddress}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Başlama tarixi</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{startDate}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Bitmə tarixi</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{endDate}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Ümumi dərs sayı</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{totalLessons}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Bir dərsin müddəti</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{lessonDuration}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Dərs günləri və saatları</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{lessonDays}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Əsas müəllim</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{mainTeacher}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Sertifikat şərti</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{certificateCondition}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold", width: "40%" }}>Ümumi xidmət haqqı</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{totalPrice} AZN</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>İlkin ödəniş</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{initialPayment} AZN | Tarix: {initialPaymentDate}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Aylıq / hissəli ödəniş</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{monthlyPayment} AZN</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Ödəniş günü</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>Hər ayın {paymentDay}-i tarixinədək</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Xüsusi şərtlər</td>
                      <td style={{ border: "1px solid #000", padding: "8px" }}>{specialConditions}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p style={{ textAlign: "center", fontStyle: "italic", marginBottom: "2rem" }}>
                Tərəflər Əlavə 1-də göstərilən şərtləri oxuduqlarını, başa düşdüklərini və qəbul etdiklərini təsdiq edirlər.
              </p>

              <h4 style={{ fontWeight: "bold", marginBottom: "1rem" }}>13. TƏRƏFLƏRİN REKVİZİTLƏRİ VƏ İMZALARI</h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div>
                  <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>İCRAÇI</h4>
                  <p><strong>“TM VENTURES” MMC</strong></p>
                  <p>Ünvan: Bakı şəhəri, Səbail rayonu,<br/>Səid Rüstəmov 17C</p>
                  <p>VÖEN: 1310057491</p>
                  <p>Bank: Kapital Bank ASC, Yasamal filialı</p>
                  <p>IBAN: AZ26AIIB400900N9444780499103</p>
                  <p>Filial kodu: 200037</p>
                  <p>Direktor: Tamerlan Məmmədov</p>
                  <br/><br/>
                  <p>İmza: ____________________ M.Y.</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>SİFARİŞÇİ / VALİDEYN</h4>
                  <p>Ad, soyad: {parentName}</p>
                  <p>Ş/V №: {parentIdCard}</p>
                  <p>FİN: {parentFin}</p>
                  <p>Telefon: {parentPhone}</p>
                  <br/><br/>
                  <p>İmza: ____________________</p>
                  <p>Tarix: ____________________</p>
                  <br/><br/>
                  <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem", marginTop: "1rem" }}>TƏLƏBƏNİN TANIŞLIQ İMZASI</h4>
                  <p style={{ fontSize: "10pt" }}>(14 yaşdan yuxarı olduqda):</p>
                  <br/>
                  <p>İmza: ____________________</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
