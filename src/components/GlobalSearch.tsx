"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, 
  X, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import styles from "./GlobalSearch.module.css";

interface StudentResult {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface TeacherResult {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

interface GroupResult {
  id: string;
  name: string;
  program: string;
  room: string;
}

interface SearchResults {
  students: StudentResult[];
  teachers: TeacherResult[];
  groups: GroupResult[];
}

export default function GlobalSearch() {
  const t = useTranslations("Search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Perform search with debounce
  const executeSearch = useCallback(async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults(null);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const data: SearchResults = await res.json();
        setResults(data);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Search fetch error:", err);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      executeSearch(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, executeSearch]);

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSelectResult = () => {
    setIsOpen(false);
    setQuery("");
    setResults(null);
  };

  const totalResults = results 
    ? (results.students?.length || 0) + (results.teachers?.length || 0) + (results.groups?.length || 0)
    : 0;

  const hasSearched = query.trim().length > 0;
  const noResultsFound = hasSearched && !loading && results !== null && totalResults === 0;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t("placeholder")}
          className={styles.searchInput}
          autoComplete="off"
          spellCheck="false"
        />

        <div className={styles.actions}>
          {loading && <Loader2 size={16} className={styles.spinner} />}
          {query.length > 0 && !loading && (
            <button 
              type="button" 
              onClick={handleClear} 
              className={styles.clearBtn}
              title={t("clear")}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Active search results */}
          {hasSearched && (
            <div className={styles.resultsList}>
              {/* Students Section */}
              {results && results.students && results.students.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>
                    <div className={styles.sectionHeaderLeft}>
                      <GraduationCap size={15} />
                      <span>{t("students")}</span>
                    </div>
                    <span className={styles.badge}>{results.students.length}</span>
                  </div>
                  {results.students.map((student) => (
                    <Link
                      key={student.id}
                      href={`/dashboard/students/${student.id}`}
                      onClick={handleSelectResult}
                      className={styles.itemLink}
                    >
                      <div className={styles.resultItem}>
                        <div className={styles.itemMain}>
                          <span className={styles.itemName}>{student.name}</span>
                          <span className={styles.itemSub}>
                            {student.email || student.phone || "ID: " + student.id.substring(0, 8)}
                          </span>
                        </div>
                        <ArrowRight size={16} className={styles.itemArrow} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Teachers Section */}
              {results && results.teachers && results.teachers.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>
                    <div className={styles.sectionHeaderLeft}>
                      <BookOpen size={15} />
                      <span>{t("teachers")}</span>
                    </div>
                    <span className={styles.badge}>{results.teachers.length}</span>
                  </div>
                  {results.teachers.map((teacher) => (
                    <Link
                      key={teacher.id}
                      href={`/dashboard/teachers/${teacher.id}`}
                      onClick={handleSelectResult}
                      className={styles.itemLink}
                    >
                      <div className={styles.resultItem}>
                        <div className={styles.itemMain}>
                          <span className={styles.itemName}>{teacher.name}</span>
                          <span className={styles.itemSub}>
                            {teacher.specialization ? `${teacher.specialization} • ` : ""}
                            {teacher.email || "ID: " + teacher.id.substring(0, 8)}
                          </span>
                        </div>
                        <ArrowRight size={16} className={styles.itemArrow} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Groups Section */}
              {results && results.groups && results.groups.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>
                    <div className={styles.sectionHeaderLeft}>
                      <Layers size={15} />
                      <span>{t("groups")}</span>
                    </div>
                    <span className={styles.badge}>{results.groups.length}</span>
                  </div>
                  {results.groups.map((group) => (
                    <Link
                      key={group.id}
                      href={`/dashboard/groups/${group.id}`}
                      onClick={handleSelectResult}
                      className={styles.itemLink}
                    >
                      <div className={styles.resultItem}>
                        <div className={styles.itemMain}>
                          <span className={styles.itemName}>{group.name}</span>
                          <span className={styles.itemSub}>
                            {group.program ? `${group.program}` : ""}
                            {group.room ? ` • ${t("room")}: ${group.room}` : ""}
                          </span>
                        </div>
                        <ArrowRight size={16} className={styles.itemArrow} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Empty state when no matches found */}
              {noResultsFound && (
                <div className={styles.emptyState}>
                  <Search size={32} className={styles.emptyIcon} />
                  <div className={styles.emptyTitle}>{t("noResultsShort")}</div>
                  <div className={styles.emptySub}>
                    {t("noResults", { query: query.trim() })}
                  </div>
                </div>
              )}

              {/* Loading indicator inside list if results haven't arrived yet */}
              {loading && !results && (
                <div className={styles.emptyState}>
                  <Loader2 size={28} className={styles.spinner} />
                  <div className={styles.emptySub}>{t("searching")}</div>
                </div>
              )}
            </div>
          )}

          {/* Quick Nav when input is empty */}
          {!hasSearched && (
            <div className={styles.quickNav}>
              <div className={styles.quickNavTitle}>
                <Sparkles size={13} style={{ display: "inline", marginRight: "4px" }} />
                {t("quickActions")}
              </div>
              <div className={styles.quickNavGrid}>
                <Link
                  href="/dashboard/students"
                  onClick={handleSelectResult}
                  className={styles.quickNavItem}
                >
                  <GraduationCap size={18} color="var(--aqua-teal)" />
                  <span>{t("students")}</span>
                </Link>
                <Link
                  href="/dashboard/teachers"
                  onClick={handleSelectResult}
                  className={styles.quickNavItem}
                >
                  <BookOpen size={18} color="var(--aqua-teal)" />
                  <span>{t("teachers")}</span>
                </Link>
                <Link
                  href="/dashboard/groups"
                  onClick={handleSelectResult}
                  className={styles.quickNavItem}
                >
                  <Layers size={18} color="var(--aqua-teal)" />
                  <span>{t("groups")}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Dropdown footer info */}
          <div className={styles.dropdownFooter}>
            <div className={styles.footerHint}>
              <span>{t("shortcutHint")}</span>
            </div>
            {totalResults > 0 && hasSearched && (
              <span>{totalResults} {totalResults === 1 ? t("result") : t("results")}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
