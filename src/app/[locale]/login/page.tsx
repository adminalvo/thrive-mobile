"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { LogIn, Mail, Lock, LayoutDashboard, Eye, EyeOff } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
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
            <p className={styles.brandSubtitle}>Empowering the future of education with intelligent management.</p>
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
              <h2 className={styles.formTitle}>Welcome Back</h2>
              <p className={styles.subtitle}>Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
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
                <LogIn size={20} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
