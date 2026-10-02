"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, X, Bell, AlertOctagon } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityAlertModal() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if session or localStorage matches Tamerlan or Admin
    const checkTarget = () => {
      const email = (session?.user?.email || "").toLowerCase();
      const name = (((session?.user as any)?.name) || "").toLowerCase();
      const role = ((session?.user as any)?.role || "").toLowerCase();

      // Matches Tamerlan Mammadov, Super Admin, or Admin
      const isTarget = 
        email.includes("tamerlan") || 
        name.includes("tamerlan") || 
        name.includes("mammedov") ||
        role === "super_admin" ||
        role === "admin";

      if (isTarget) {
        setIsVisible(true);
        // Play subtle system notification chime
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch (e) {
          // Audio autoplay might be blocked before user interaction, safe to ignore
        }
      }
    };

    // Check immediately and also after small delay for session hydration
    checkTarget();
    const t = setTimeout(checkTarget, 400);
    return () => clearTimeout(t);
  }, [session]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {/* 1. Floating Top-Right System Notification Popup */}
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          maxWidth: "460px",
          width: "calc(100vw - 40px)",
          zIndex: 9999999,
          background: "linear-gradient(135deg, rgba(28, 12, 16, 0.97) 0%, rgba(15, 10, 14, 0.98) 100%)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(239, 68, 68, 0.45)",
          borderRadius: "14px",
          boxShadow: "0 20px 45px -10px rgba(239, 68, 68, 0.35), 0 0 0 1px rgba(239, 68, 68, 0.2)",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            background: "linear-gradient(90deg, #dc2626 0%, #991b1b 100%)",
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#fef08a",
                boxShadow: "0 0 8px #fef08a",
                animation: "pulse 1.5s infinite"
              }}
            />
            <ShieldAlert size={16} color="#fff" />
            <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              SİSTEM BİLDİRİŞİ (SYSTEM NOTIFICATION)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.25)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
              İndi
            </span>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                opacity: 0.85
              }}
              title="Bağla"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "1.1rem 1.25rem" }}>
          <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
            <div
              style={{
                background: "rgba(239, 68, 68, 0.18)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "10px",
                padding: "0.6rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <AlertOctagon size={26} color="#ef4444" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <span
                  style={{
                    background: "rgba(239, 68, 68, 0.25)",
                    color: "#fca5a5",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    border: "1px solid rgba(239, 68, 68, 0.3)"
                  }}
                >
                  CRITICAL ALERT
                </span>
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>03.10.2026</span>
              </div>

              {/* Exact user requested message */}
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                  color: "#fee2e2",
                  fontWeight: "500",
                  margin: "0.5rem 0 0.85rem 0"
                }}
              >
                Diqqət. CRM məlumatları Tamerlan SUPER ADMİN hesabı tərəfindən 03.10.2026 tarixində dəyişdirilib. Datalar təhlükə altındadır. Yaranacaq problem sistemdə çatışmazlıqlara yol aça bilər.
              </p>

              {/* Bottom action buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                  Status: #SEC-031026
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setIsExpanded(true)}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#e5e7eb",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    Ətraflı Bax
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    style={{
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      border: "none",
                      color: "#fff",
                      padding: "0.35rem 0.9rem",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)"
                    }}
                  >
                    Təsdiq Et
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Expanded Center Modal View (when user clicks 'Ətraflı Bax') */}
      {isExpanded && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 99999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setIsExpanded(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              maxWidth: "540px",
              width: "100%",
              background: "#181014",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.3)",
              color: "#fff"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldAlert size={22} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>Sistem Təhlükəsizlik Xəbərdarlığı</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "10px",
                padding: "1.2rem",
                color: "#fee2e2",
                lineHeight: "1.6",
                fontSize: "0.95rem",
                marginBottom: "1.25rem"
              }}
            >
              Diqqət. CRM məlumatları Tamerlan SUPER ADMİN hesabı tərəfindən 03.10.2026 tarixində dəyişdirilib. Datalar təhlükə altındadır. Yaranacaq problem sistemdə çatışmazlıqlara yol aça bilər.
            </div>

            <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
              ⚠️ Audit protokolu: Bu xəbərdarlıq sistem tərəfindən Tamerlan SUPER ADMİN sessiyası aşkar edildikdə avtomatik olaraq generirlənir və verilənlərin bütövlüyü təmin olunana qədər qüvvədə qalır.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setIsVisible(false);
                }}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Bildirişi Bağla
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
