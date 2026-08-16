"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { LogIn, Mail, Lock, LayoutDashboard } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      {/* Login Container */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={styles.loginContainer}
      >
        <div className={styles.loginHeader}>
          <LayoutDashboard className={styles.logoAccent} size={36} />
          <h1 className={styles.title}>Thrive<span className={styles.logoAccent}>CRM</span></h1>
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
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>
          
          {error && <div className={styles.errorText}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <LogIn size={20} />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>Forgot password? <span className={styles.link}>Contact Administrator</span></p>
        </div>
      </motion.div>
    </main>
  );
}
