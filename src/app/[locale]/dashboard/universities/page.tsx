"use client";

import styles from "../page.module.css";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, MapPin, Building2, Globe } from "lucide-react";
import { useState } from "react";

export default function UniversitiesPage() {
  const t = useTranslations("Universities");
  const c = useTranslations("Common");
  const [search, setSearch] = useState("");

  const allUniversities = [
    { name: "University of Barcelona", country: "İspaniya", enCountry: "Spain", ruCountry: "Испания", rank: "Top 100", type: "Public" },
    { name: "Complutense University of Madrid", country: "İspaniya", enCountry: "Spain", ruCountry: "Испания", rank: "Top 200", type: "Public" },
    
    { name: "Lund University", country: "İsveç", enCountry: "Sweden", ruCountry: "Швеция", rank: "Top 100", type: "Public" },
    { name: "Uppsala University", country: "İsveç", enCountry: "Sweden", ruCountry: "Швеция", rank: "Top 100", type: "Public" },
    
    { name: "Trinity College Dublin", country: "İrlandiya", enCountry: "Ireland", ruCountry: "Ирландия", rank: "Top 100", type: "Public" },
    { name: "University College Dublin", country: "İrlandiya", enCountry: "Ireland", ruCountry: "Ирландия", rank: "Top 200", type: "Public" },
    
    { name: "Tsinghua University", country: "Çin", enCountry: "China", ruCountry: "Китай", rank: "Top 50", type: "Public" },
    { name: "Peking University", country: "Çin", enCountry: "China", ruCountry: "Китай", rank: "Top 50", type: "Public" },
    
    { name: "University of Auckland", country: "Yeni Zelandiya", enCountry: "New Zealand", ruCountry: "Новая Зеландия", rank: "Top 100", type: "Public" },
    { name: "University of Otago", country: "Yeni Zelandiya", enCountry: "New Zealand", ruCountry: "Новая Зеландия", rank: "Top 200", type: "Public" },
    
    { name: "University of Tokyo", country: "Yaponiya", enCountry: "Japan", ruCountry: "Япония", rank: "Top 50", type: "Public" },
    { name: "Kyoto University", country: "Yaponiya", enCountry: "Japan", ruCountry: "Япония", rank: "Top 50", type: "Public" },
    
    { name: "Koç University", country: "Türkiyə", enCountry: "Turkey", ruCountry: "Турция", rank: "Top 500", type: "Private" },
    { name: "Boğaziçi University", country: "Türkiyə", enCountry: "Turkey", ruCountry: "Турция", rank: "Top 500", type: "Public" },
    
    { name: "National University of Singapore", country: "Sinqapur", enCountry: "Singapore", ruCountry: "Сингапур", rank: "Top 20", type: "Public" },
    { name: "Nanyang Technological University", country: "Sinqapur", enCountry: "Singapore", ruCountry: "Сингапур", rank: "Top 50", type: "Public" },
    
    { name: "University of Warsaw", country: "Polşa", enCountry: "Poland", ruCountry: "Польша", rank: "Top 300", type: "Public" },
    { name: "Jagiellonian University", country: "Polşa", enCountry: "Poland", ruCountry: "Польша", rank: "Top 400", type: "Public" },
    
    { name: "University of Amsterdam", country: "Niderland", enCountry: "Netherlands", ruCountry: "Нидерланды", rank: "Top 100", type: "Public" },
    { name: "Delft University of Technology", country: "Niderland", enCountry: "Netherlands", ruCountry: "Нидерланды", rank: "Top 100", type: "Public" },
    
    { name: "University of Toronto", country: "Kanada", enCountry: "Canada", ruCountry: "Канада", rank: "Top 50", type: "Public" },
    { name: "University of British Columbia", country: "Kanada", enCountry: "Canada", ruCountry: "Канада", rank: "Top 50", type: "Public" },
    
    { name: "Sorbonne University", country: "Fransa", enCountry: "France", ruCountry: "Франция", rank: "Top 100", type: "Public" },
    { name: "École Polytechnique", country: "Fransa", enCountry: "France", ruCountry: "Франция", rank: "Top 100", type: "Public" },
    
    { name: "Seoul National University", country: "Cənubi Koreya", enCountry: "South Korea", ruCountry: "Южная Корея", rank: "Top 100", type: "Public" },
    { name: "KAIST", country: "Cənubi Koreya", enCountry: "South Korea", ruCountry: "Южная Корея", rank: "Top 100", type: "Public" },
    
    { name: "United Arab Emirates University", country: "BƏƏ", enCountry: "UAE", ruCountry: "ОАЭ", rank: "Top 300", type: "Public" },
    { name: "Khalifa University", country: "BƏƏ", enCountry: "UAE", ruCountry: "ОАЭ", rank: "Top 300", type: "Public" },
    
    { name: "University of Oxford", country: "Birləşmiş Krallıq", enCountry: "UK", ruCountry: "Великобритания", rank: "Top 10", type: "Public" },
    { name: "University of Cambridge", country: "Birləşmiş Krallıq", enCountry: "UK", ruCountry: "Великобритания", rank: "Top 10", type: "Public" },
    
    { name: "University of Melbourne", country: "Avstraliya", enCountry: "Australia", ruCountry: "Австралия", rank: "Top 50", type: "Public" },
    { name: "University of Sydney", country: "Avstraliya", enCountry: "Australia", ruCountry: "Австралия", rank: "Top 50", type: "Public" },
    
    { name: "Technical University of Munich", country: "Almaniya", enCountry: "Germany", ruCountry: "Германия", rank: "Top 50", type: "Public" },
    { name: "LMU Munich", country: "Almaniya", enCountry: "Germany", ruCountry: "Германия", rank: "Top 100", type: "Public" },
    
    { name: "Harvard University", country: "ABŞ", enCountry: "USA", ruCountry: "США", rank: "Top 10", type: "Private" },
    { name: "Massachusetts Institute of Technology (MIT)", country: "ABŞ", enCountry: "USA", ruCountry: "США", rank: "Top 10", type: "Private" },
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
            placeholder={c("search") || "Universitet və ya ölkə axtar..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", background: "var(--surface-light)", border: "1px solid var(--border-color)", padding: "0.875rem 1rem 0.875rem 2.5rem", borderRadius: "10px", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {filtered.map((uni, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx % 10) * 0.05 }}
            style={{
              background: "var(--surface-dark)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", color: "var(--aqua-teal)" }}>
              <div style={{ background: "rgba(43, 217, 185, 0.1)", padding: "0.75rem", borderRadius: "10px" }}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", margin: "0 0 0.5rem 0", lineHeight: "1.4" }}>{uni.name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <MapPin size={14} />
                  <span>{uni.country} ({uni.enCountry})</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <span style={{ background: "var(--surface-light)", border: "1px solid var(--border-color)", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {uni.rank}
              </span>
              <span style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.8rem", color: "#10b981" }}>
                {uni.type}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          <Globe size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h3>Nəticə tapılmadı</h3>
          <p>Axtarışınıza uyğun universitet mövcud deyil.</p>
        </div>
      )}
    </div>
  );
}
