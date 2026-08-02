'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../dashboard.module.css';

const faqData = {
  az: [
    { 
      q: "Aylıq ödənişləri necə edə bilərəm?", 
      a: "Hazırda ödənişlər təhsil mərkəzində nağd və ya bank köçürməsi (karta) vasitəsilə qəbul edilir. Yaxın gələcəkdə tətbiq daxilində (Stripe/PayPal) birbaşa ödəniş sistemi aktivləşdiriləcək." 
    },
    { 
      q: "Dərs saatlarımı dəyişə bilərəmmi?", 
      a: "Bəli, dərs saatlarınızı dəyişdirmək üçün 'Konsultasiya Rezerv Et' bölməsindən müəlliminizlə görüş təyin edə və ya qeydiyyat şöbəsinə yaxınlaşa bilərsiniz. Dəyişikliklər qruplarda boş yer olduqda edilir." 
    },
    { 
      q: "Dərslərə geciksəm və ya gəlməsəm nə olur?", 
      a: "Valideynləriniz (əgər valideyn hesabı ilə qeydiyyatdan keçiblərsə) sizin hər bir davamiyyət faizinizi və gecikmələrinizi xüsusi idarə panelində (Parent Dashboard) görə bilirlər. Çox sayda qayıb halında xəbərdarlıq göndərilir." 
    },
    { 
      q: "Kursu bitirdikdən sonra sertifikat verilirmi?", 
      a: "Bəli. Kurs proqramını (məsələn, SAT, CSCA, Duolingo) müvəffəqiyyətlə başa vuran və yekun imtahandan minimum tələb olunan balı toplayan hər bir tələbəyə rəsmi sertifikat təqdim olunur." 
    }
  ],
  en: [
    { 
      q: "How can I make monthly payments?", 
      a: "Currently, payments are accepted at the education center in cash or via bank transfer. Direct in-app payments (Stripe/PayPal) will be activated in the near future." 
    },
    { 
      q: "Can I change my class hours?", 
      a: "Yes, to change your class hours you can book a meeting with your teacher via 'Book Consultation' or approach the registration desk. Changes are made if there is available space in other groups." 
    },
    { 
      q: "What happens if I'm late or absent?", 
      a: "Your parents (if registered with a parent account) can view your attendance percentage and delays on their dedicated dashboard. Multiple unexcused absences will result in a warning." 
    },
    { 
      q: "Do I get a certificate after completing the course?", 
      a: "Yes. Every student who successfully completes the course program (e.g., SAT, CSCA, Duolingo) and scores above the minimum requirement on the final exam receives an official certificate." 
    }
  ],
  ru: [
    { 
      q: "Как я могу вносить ежемесячные платежи?", 
      a: "В настоящее время платежи принимаются в учебном центре наличными или банковским переводом (на карту). В ближайшее время будет активирована система прямых платежей в приложении (Stripe/PayPal)." 
    },
    { 
      q: "Могу ли я изменить часы занятий?", 
      a: "Да, для изменения времени занятий вы можете записаться на встречу с преподавателем через раздел 'Бронирование консультации' или подойти в отдел регистрации. Изменения вносятся при наличии свободных мест в группах." 
    },
    { 
      q: "Что будет, если я опоздаю или пропущу занятие?", 
      a: "Ваши родители (если они зарегистрированы с родительским аккаунтом) могут видеть процент вашей посещаемости и опоздания в специальной панели. За большое количество пропусков отправляется предупреждение." 
    },
    { 
      q: "Выдается ли сертификат после окончания курса?", 
      a: "Да. Каждый студент, успешно завершивший программу курса (например, SAT, CSCA, Duolingo) и набравший минимальный требуемый балл на итоговом экзамене, получает официальный сертификат." 
    }
  ]
};

export default function FAQPage() {
  const { lang } = useLanguage();
  const currentFaq = faqData[lang] || faqData['en'];
  
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getTitle = () => {
    if (lang === 'az') return "Tez-tez Verilən Suallar";
    if (lang === 'ru') return "Часто Задаваемые Вопросы";
    return "Frequently Asked Questions";
  };

  const getSubtitle = () => {
    if (lang === 'az') return "Sizi maraqlandıran sualların cavabları.";
    if (lang === 'ru') return "Ответы на вопросы, которые вас интересуют.";
    return "Answers to the questions you are curious about.";
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <HelpCircle size={32} color="#38bdf8" />
        <h1 className={styles.greeting} style={{ marginBottom: 0 }}>FAQ</h1>
      </div>
      <h2 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '5px' }}>{getTitle()}</h2>
      <p className={styles.subtitle} style={{ marginBottom: '30px' }}>
        {getSubtitle()}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentFaq.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={styles.glassCard} 
              style={{ 
                padding: '0', 
                overflow: 'hidden', 
                border: isOpen ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)',
                transition: 'border 0.3s ease'
              }}
            >
              <button 
                onClick={() => toggleAccordion(index)}
                style={{ 
                  width: '100%', 
                  padding: '20px', 
                  background: 'transparent', 
                  border: 'none', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ color: isOpen ? '#38bdf8' : '#f8fafc', fontSize: '1.05rem', fontWeight: 500, lineHeight: '1.4', paddingRight: '15px' }}>
                  {item.q}
                </span>
                <div style={{ flexShrink: 0 }}>
                  {isOpen ? <ChevronUp color="#38bdf8" /> : <ChevronDown color="#94a3b8" />}
                </div>
              </button>
              
              <div 
                style={{ 
                  maxHeight: isOpen ? '200px' : '0', 
                  overflow: 'hidden', 
                  transition: 'max-height 0.3s ease-in-out',
                  padding: isOpen ? '0 20px 20px 20px' : '0 20px'
                }}
              >
                <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {item.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '50px', color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px' }}>
        DEVELOPED BY HACTAG 2026
      </div>
    </div>
  );
}
