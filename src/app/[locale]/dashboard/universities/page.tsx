"use client";

import styles from "../page.module.css";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

export default function UniversitiesPage() {
  const t = useTranslations("Universities");
  const c = useTranslations("Common");
  const [search, setSearch] = useState("");

  const allUniversities = [
    { name: "Spain Universities", country: "İspaniya", enCountry: "Spain", ruCountry: "Испания" },
    { name: "Sweden Universities", country: "İsveç", enCountry: "Sweden", ruCountry: "Швеция" },
    { name: "Ireland Universities", country: "İrlandiya", enCountry: "Ireland", ruCountry: "Ирландия" },
    { name: "China Universities", country: "Çin", enCountry: "China", ruCountry: "Китай" },
    { name: "New Zealand Universities", country: "Yeni Zelandiya", enCountry: "New Zealand", ruCountry: "Новая Зеландия" },
    { name: "Japan Universities", country: "Yaponiya", enCountry: "Japan", ruCountry: "Япония" },
    { name: "Turkey Universities", country: "Türkiyə", enCountry: "Turkey", ruCountry: "Турция" },
    { name: "Singapore Universities", country: "Sinqapur", enCountry: "Singapore", ruCountry: "Сингапур" },
    { name: "Poland Universities", country: "Polşa", enCountry: "Poland", ruCountry: "Польша" },
    { name: "Netherlands Universities", country: "Niderland", enCountry: "Netherlands", ruCountry: "Нидерланды" },
    { name: "Canada Universities", country: "Kanada", enCountry: "Canada", ruCountry: "Канада" },
    { name: "France Universities", country: "Fransa", enCountry: "France", ruCountry: "Франция" },
    { name: "South Korea Universities", country: "Cənubi Koreya", enCountry: "South Korea", ruCountry: "Южная Корея" },
    { name: "UAE Universities", country: "BƏƏ", enCountry: "UAE", ruCountry: "ОАЭ" },
    { name: "UK Universities", country: "Birləşmiş Krallıq", enCountry: "UK", ruCountry: "Великобритания" },
    { name: "Australia Universities", country: "Avstraliya", enCountry: "Australia", ruCountry: "Австралия" },
    { name: "Germany Universities", country: "Almaniya", enCountry: "Germany", ruCountry: "Германия" },
    { name: "USA Universities", country: "ABŞ", enCountry: "USA", ruCountry: "США" },
  ];

  const filtered = allUniversities.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.country.toLowerCase().includes(search.toLowerCase()) || 
    u.enCountry.toLowerCase().includes(search.toLowerCase()) ||
    u.ruCountry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.dashboard}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.pageHeader}
      >
        <div>
          <h1 className={styles.pageTitle}>{t("title") || "Xaricdə Təhsil (Universitetlər)"}</h1>
          <p className={styles.pageSubtitle}>{t("subtitle") || "Tərəfdaş universitetlərin siyahısı"}</p>
        </div>
      </motion.div>

      <div className={styles.searchBarContainer} style={{ marginBottom: "2rem" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input 
            type="text" 
            placeholder={c("search") || "Axtar..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", background: "var(--surface-light)", border: "1px solid var(--border-color)", padding: "0.875rem 1rem 0.875rem 2.5rem", borderRadius: "10px", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {filtered.map((uni, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              background: "var(--surface-dark)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--aqua-teal)" }}>
              <MapPin size={24} />
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", margin: 0 }}>{uni.name}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <p>📍 {uni.country} / {uni.enCountry}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
