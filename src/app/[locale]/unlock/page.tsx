"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./page.module.css";

export default function UnlockPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        setError("Invalid passcode. Access denied.");
        setPasscode("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>

      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={styles.container}
      >
        <Lock className={styles.logoAccent} size={48} />
        <h1 className={styles.title}>Protected Area</h1>
        <p className={styles.subtitle}>Please enter the site passcode to continue.</p>

        <form onSubmit={handleUnlock} className={styles.form}>
          <div className={styles.inputWrapper}>
            <KeyRound className={styles.inputIcon} size={20} />
            <input 
              type="password" 
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required 
              autoFocus
            />
          </div>
          
          {error && <div className={styles.errorText}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading || !passcode}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Unlock Site"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
