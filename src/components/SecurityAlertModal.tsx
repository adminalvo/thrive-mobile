"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, X, AlertOctagon, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityAlertModal() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const email = (session.user.email || "").toLowerCase();
    const name = ((session.user as any).name || "").toLowerCase();
    const role = (session.user.role || "").toLowerCase();

    // Check if logged in user is Tamerlan or Super Admin
    const isTamerlan = 
      email.includes("tamerlan") || 
      name.includes("tamerlan") || 
      role === "super_admin";

    if (isTamerlan) {
      // Show immediately
      setIsOpen(true);
    }
  }, [session]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            maxWidth: "580px",
            width: "100%",
            background: "linear-gradient(145deg, #1e1114 0%, #110d12 100%)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.2)",
            overflow: "hidden",
            color: "#fff",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          {/* Top Warning Strip */}
          <div 
            style={{
              background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)",
              padding: "0.6rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldAlert size={18} color="#fff" />
              <span style={{ fontSize: "0.75rem", fontWeight: "800", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                SİSTEM TƏHLÜKƏSİZLİK VƏ İZLƏMƏ XİDMƏTİ
              </span>
            </div>
            <span style={{ fontSize: "0.7rem", opacity: 0.9, background: "rgba(0,0,0,0.25)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
              #SEC-031026-ERR
            </span>
          </div>

          {/* Modal Content */}
          <div style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div 
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px",
                  padding: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <AlertOctagon size={32} color="#ef4444" />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span 
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#f87171",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}
                  >
                    CRITICAL ERROR
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>03.10.2026</span>
                </div>

                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fff", marginBottom: "0.75rem", lineHeight: "1.4" }}>
                  Sistem Məlumatlarının Dəyişdirilməsi Xəbərdarlığı
                </h3>

                <div 
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "10px",
                    padding: "1rem 1.15rem",
                    marginBottom: "1.25rem",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: "#fecaca",
                    fontWeight: "500"
                  }}
                >
                  Diqqət. CRM məlumatları Tamerlan SUPER ADMİN hesabı tərəfindən 03.10.2026 tarixində dəyişdirilib. Datalar təhlükə altındadır. Yaranacaq problem sistemdə çatışmazlıqlara yol aça bilər.
                </div>

                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    marginBottom: "1.5rem"
                  }}
                >
                  <Info size={15} color="#9ca3af" />
                  <span>Bu bildiriş sistem audit loqu tərəfindən avtomatik generasiya olunmuşdur.</span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "0.65rem 1.5rem",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Anladım və Təsdiq Edirəm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
