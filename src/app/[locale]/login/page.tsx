"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { LogIn, Mail, Lock, LayoutDashboard, Eye, EyeOff } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const h = useTranslations("HomePage");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-load dashboard bundle in background so transition is instant
  useEffect(() => {
    try {
      router.prefetch("/dashboard");
    } catch (_) {}
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password: password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.ok) {
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError("Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Background Orbs */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>

      <div className={styles.layoutWrapper}>
        {/* Left Side: Branding */}
        <motion.div 
          className={styles.leftPanel}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={styles.brandContent}>
            <LayoutDashboard className={styles.hugeLogo} size={64} />
            <h1 className={styles.hugeTitle}>Thrive<span className={styles.logoAccent}>CRM</span></h1>
            <p className={styles.brandSubtitle}>{t("slogan") || "Empowering the future of education with intelligent management."}</p>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <div className={styles.rightPanel}>
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className={styles.loginContainer}
          >
            <div className={styles.loginHeader}>
              <h2 className={styles.formTitle}>{t("welcomeBack") || "Welcome Back"}</h2>
              <p className={styles.subtitle}>{t("signInSubtitle") || "Sign in to your account"}</p>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>{t("emailAddress") || t("emailLabel") || "Email Address"}</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input 
                    type="email" 
                    placeholder={t("enterEmail") || t("emailPlaceholder") || "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{t("password") || t("passwordLabel") || "Password"}</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t("enterPassword") || t("passwordPlaceholder") || "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {error && <div className={styles.errorText}>{error}</div>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (t("loading") || "Signing in...") : (t("loginBtn") || "Sign In")}
              </button>
            </form>
          </motion.div>
          
          <motion.div 
            className={styles.developerCredit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            {h("developedBy") || "Developed by"} <span className={styles.hactag}>HacTag</span>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
