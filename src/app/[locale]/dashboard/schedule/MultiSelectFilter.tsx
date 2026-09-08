"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectFilterProps {
  label: string;
  icon: React.ReactNode;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectFilter({
  label,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder = "Axtarış..."
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(opt => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    onChange(options.map(o => o.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Compute trigger button label text
  const triggerLabel = useMemo(() => {
    if (selectedValues.length === 0) return label;
    if (selectedValues.length === 1) {
      const found = options.find(o => o.value === selectedValues[0]);
      return found ? found.label : selectedValues[0];
    }
    if (selectedValues.length === 2) {
      const l1 = options.find(o => o.value === selectedValues[0])?.label || selectedValues[0];
      const l2 = options.find(o => o.value === selectedValues[1])?.label || selectedValues[1];
      return `${l1}, ${l2}`;
    }
    return `${selectedValues.length} seçilib`;
  }, [selectedValues, options, label]);

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  return (
    <div className={styles.multiSelectContainer} ref={containerRef}>
      <button
        type="button"
        className={`${styles.multiSelectTrigger} ${selectedValues.length > 0 ? styles.multiSelectTriggerActive : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title={selectedValues.length > 0 ? selectedValues.join(", ") : label}
      >
        <div className={styles.triggerContent}>
          <span className={styles.triggerIcon}>{icon}</span>
          <span className={styles.triggerText}>{triggerLabel}</span>
        </div>

        <div className={styles.triggerActions}>
          {selectedValues.length > 0 && (
            <>
              <span className={styles.filterCountBadge}>{selectedValues.length}</span>
              <span
                role="button"
                className={styles.clearTriggerBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                title="Seçimi təmizlə"
              >
                <X size={12} />
              </span>
            </>
          )}
          <ChevronDown size={15} className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.multiSelectDropdown}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search Input if more than 4 options */}
            {options.length > 4 && (
              <div className={styles.dropdownSearch}>
                <Search size={14} style={{ color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Quick Actions Header */}
            <div className={styles.dropdownActionsBar}>
              <button
                type="button"
                className={styles.dropdownActionBtn}
                onClick={handleSelectAll}
                disabled={isAllSelected}
                style={{ opacity: isAllSelected ? 0.5 : 1 }}
              >
                Hamısını seç
              </button>
              {selectedValues.length > 0 && (
                <button
                  type="button"
                  className={`${styles.dropdownActionBtn} ${styles.dropdownClearBtn}`}
                  onClick={handleClearAll}
                >
                  Sıfırla
                </button>
              )}
            </div>

            {/* Options List */}
            <div className={styles.dropdownOptionsList}>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: "0.85rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                  Uyğun nəticə tapılmadı
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionSelected : ""}`}
                      onClick={() => toggleOption(opt.value)}
                    >
                      <div className={styles.dropdownOptionLeft}>
                        <div className={`${styles.checkboxSquare} ${isSelected ? styles.checkboxChecked : ""}`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className={styles.optionLabel} title={opt.label}>
                          {opt.label}
                        </span>
                      </div>
                      {typeof opt.count === "number" && (
                        <span className={styles.optionCountBadge}>
                          {opt.count}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
