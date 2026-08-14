"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { LogIn, LayoutDashboard, Fingerprint, Network, Cpu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const t = useTranslations("HomePage");
  const locale = useParams().locale as string;
  const router = useRouter();
  const pathname = usePathname();

  const typewriterWords = [
    t("typewriter1"),
    t("typewriter2"),
    t("typewriter3"),
    t("typewriter4"),
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    let timeout: NodeJS.Timeout;
    const type = () => {
      const currentWord = typewriterWords[currentWordIndex];
      const isFullWord = currentText === currentWord;
      const isEmpty = currentText === "";

      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
      } else {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
      }

      let typeSpeed = isDeleting ? 40 : 80;

      if (!isDeleting && isFullWord) {
        typeSpeed = 2500;
        setIsDeleting(true);
      } else if (isDeleting && isEmpty) {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % typewriterWords.length);
        typeSpeed = 400;
      }

      timeout = setTimeout(type, typeSpeed);
    };

    timeout = setTimeout(type, 100);
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, loading, typewriterWords]);

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  if (loading) {
    return (
      <div className={styles.preloader}>
        <div className={styles.cyberSpinner}>
          <div className={styles.innerSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      {/* Background Glowing Orbs */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={styles.navbar}
      >
        <div className={styles.navSide}></div>
        <div className={styles.logo}>
          <LayoutDashboard className={styles.logoAccent} size={22} />
          <span>Thrive<span className={styles.logoAccent}>CRM</span></span>
        </div>
        <div className={`${styles.navSide} ${styles.navRight}`}>
          <Link href="/login">
            <button className={styles.loginBtn}>
              <LogIn size={18} />
              <span className={styles.loginText}>{t("login")}</span>
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* Futuristic Hero */}
      <section className={styles.hero}>
        <div className={styles.gridOverlay}></div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1}}
          className={styles.typewriterContainer}
        >
          <span className={styles.typewriterText}>{currentText}</span>
          <span className={styles.cursor}></span>
        </motion.div>
      </section>

      {/* About Section */}
      <motion.section 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1}}
        className={styles.about}
      >
        <h2 className={styles.aboutTitle}>{t("aboutTitle")}</h2>
        <p className={styles.aboutText}>{t("aboutText")}</p>
      </motion.section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.footerSide} ${styles.footerLeft}`}>
          <a href="https://www.thrive.az" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
            {t("website")}
          </a>
        </div>
        
        <div className={styles.footerCenter}>
          <p>{t("developedBy")} <span className={styles.hactag}>HacTag</span></p>
        </div>
        
        <div className={`${styles.footerSide} ${styles.footerRight}`}>
          <div className={styles.langSelector}>
            <span 
              className={locale === "az" ? styles.activeLang : styles.lang}
              onClick={() => changeLanguage("az")}
            >AZ</span>
            <span className={styles.langSep}>|</span>
            <span 
              className={locale === "en" ? styles.activeLang : styles.lang}
              onClick={() => changeLanguage("en")}
            >EN</span>
            <span className={styles.langSep}>|</span>
            <span 
              className={locale === "ru" ? styles.activeLang : styles.lang}
              onClick={() => changeLanguage("ru")}
            >RU</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
