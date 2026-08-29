"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./page.module.css";
import { Plus, MoreVertical, Calendar, Flag, User, X, Edit2, Trash2, Search, Check, Users, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import { apiFetch } from "@/lib/apiClient";

interface AssigneeUser {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string | null;
}

interface KanbanTask {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date?: string | null;
  dueDate?: string | null;
  deadline?: string | null;
  assignee?: any;
  assignees?: AssigneeUser[];
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

const getInitial = (name?: any) => {
  if (!name || typeof name !== "string" || !name.trim()) return "U";
  return name.trim().charAt(0).toUpperCase();
};

const getPriorityColor = (priority?: string) => {
  if (!priority) return "#3b82f6";
  const p = String(priority).toUpperCase();
  if (p === "HIGH") return "#ef4444";
  if (p === "MEDIUM") return "#f59e0b";
  return "#3b82f6";
};

const normalizeStatus = (status?: string): "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" => {
  if (!status) return "TODO";
  const s = String(status).toUpperCase();
  if (s === "IN_PROGRESS" || s === "INPROGRESS" || s === "PROGRESS") return "IN_PROGRESS";
  if (s === "REVIEW") return "REVIEW";
  if (s === "DONE" || s === "COMPLETED") return "DONE";
  return "TODO";
};

const normalizePriority = (priority?: string): "LOW" | "MEDIUM" | "HIGH" => {
  if (!priority) return "MEDIUM";
  const p = String(priority).toUpperCase();
  if (p === "HIGH") return "HIGH";
  if (p === "LOW") return "LOW";
  return "MEDIUM";
};

export default function TasksPage() {
  const tPlh = useTranslations("Placeholders");

  const t = useTranslations("Tasks");
  const c = useTranslations("Common");

  const COLUMNS: { id: KanbanTask["status"]; title: string; color: string }[] = [
    { id: "TODO", title: t("columns.TODO") || "Gözləmədə", color: "#64748b" },
    { id: "IN_PROGRESS", title: t("columns.IN_PROGRESS") || "İcrada", color: "#3b82f6" },
    { id: "REVIEW", title: t("columns.REVIEW") || "Yoxlanışda", color: "#f59e0b" },
    { id: "DONE", title: t("columns.DONE") || "Tamamlandı", color: "#10b981" }
  ];

  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssigneeFilters, setSelectedAssigneeFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileActiveColumn, setMobileActiveColumn] = useState<KanbanTask["status"]>("TODO");

  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const isSuperAdmin = userRole === "super_admin";
  const permissions = (session?.user as any)?.permissions?.tasks || {};
  const canCreate = isSuperAdmin || userRole === "admin" || Boolean(permissions.create || permissions.can_create);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [viewingTask, setViewingTask] = useState<KanbanTask | null>(null);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: KanbanTask["status"];
    priority: KanbanTask["priority"];
    dueDate: string;
    selectedAssignees: string[];
  }>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    selectedAssignees: []
  });

  const fetchTasks = async () => {
    try {
      const res = await apiFetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const cleanTasks: KanbanTask[] = data.map((item: any) => ({
            ...item,
            id: String(item.id || Math.random()),
            title: String(item.title || "Adsız Tapşırıq"),
            description: item.description ? String(item.description) : null,
            status: normalizeStatus(item.status),
            priority: normalizePriority(item.priority),
            due_date: item.due_date || item.dueDate || null,
            assignees: Array.isArray(item.assignees) ? item.assignees.map((a: any) => ({
              id: String(a?.id || ""),
              name: String(a?.name || "İstifadəçi"),
              email: String(a?.email || "")
            })) : []
          }));
          setTasks(cleanTasks);
        } else {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("fetchTasks error:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await apiFetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffUsers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("fetchStaff error:", e);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("kanban-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kanban_tasks" },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuTaskId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSelectAll = () => {
    setSelectedAssigneeFilters([]);
  };

  const handleToggleAssigneeFilter = (userId: string) => {
    setSelectedAssigneeFilters(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Filter tasks by Multi-Assignee & Search
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task) return false;
      const title = String(task.title || "").toLowerCase();
      const desc = String(task.description || "").toLowerCase();
      const q = (searchQuery || "").trim().toLowerCase();

      const matchesSearch = !q || title.includes(q) || desc.includes(q);
      if (!matchesSearch) return false;

      // If no individual filter selected -> Show All
      if (selectedAssigneeFilters.length === 0) return true;

      // Gather all possible IDs and normalized names for selected staff members
      const selectedIds = new Set<string>();
      const selectedNames = new Set<string>();

      selectedAssigneeFilters.forEach(selId => {
        selectedIds.add(selId);
        const staffObj = staffUsers.find(u => u.id === selId);
        if (staffObj) {
          selectedNames.add(staffObj.name.toLowerCase());
          if (Array.isArray(staffObj.allUserIds)) {
            staffObj.allUserIds.forEach((uid: string) => selectedIds.add(uid));
          }
        }
      });

      // Match if ANY selected user matches task.assignees
      const hasAssignee = task.assignees?.some(a => {
        if (!a) return false;
        if (selectedIds.has(a.id)) return true;
        if (a.name && selectedNames.has(String(a.name).toLowerCase())) return true;
        return false;
      });

      return Boolean(hasAssignee);
    });
  }, [tasks, selectedAssigneeFilters, searchQuery, staffUsers]);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    isDraggingRef.current = true;
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColId(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: KanbanTask["status"]) => {
    e.preventDefault();
    setDragOverColId(null);
    setDraggedTaskId(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);

    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!taskId) return;

    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(t("statusUpdated") || "Status yeniləndi");
    } catch (error) {
      toast.error(t("statusFailed") || "Tapşırıq statusunu dəyişmək mümkün olmadı");
      fetchTasks();
    }
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDirectStatusChange = async (taskId: string, newStatus: KanbanTask["status"]) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(t("statusUpdated") || "Status yeniləndi");
    } catch (error) {
      toast.error(t("statusFailed") || "Tapşırıq statusunu dəyişmək mümkün olmadı");
      fetchTasks();
    }
  };

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      selectedAssignees: []
    });
    setShowCreateModal(true);
  };

  const openEditModal = (task: KanbanTask) => {
    setEditingTask(task);
    const dateVal = task.due_date || task.dueDate || task.deadline;
    let formattedDate = "";
    if (dateVal) {
      try {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split("T")[0];
        }
      } catch (e) {}
    }

    const currentAssigneeIds = Array.isArray(task.assignees) 
      ? task.assignees.map(a => a?.id).filter(Boolean)
      : [];

    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      dueDate: formattedDate,
      selectedAssignees: currentAssigneeIds
    });
    setShowEditModal(true);
    setActiveMenuTaskId(null);
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => {
      const exists = prev.selectedAssignees.includes(userId);
      return {
        ...prev,
        selectedAssignees: exists 
          ? prev.selectedAssignees.filter(id => id !== userId)
          : [...prev.selectedAssignees, userId]
      };
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t("titleRequired") || "Zəhmət olmasa başlıq daxil edin");
      return;
    }

    try {
      const res = await apiFetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assignees: formData.selectedAssignees
        })
      });

      if (res.ok) {
        toast.success(t("createdSuccess") || "Tapşırıq yaradıldı");
        setShowCreateModal(false);
        fetchTasks();
      } else {
        toast.error(t("createdFailed") || "Tapşırığı yaratmaq mümkün olmadı");
      }
    } catch (error) {
      toast.error(c("errors.unexpected") || "Gözlənilməz xəta baş verdi");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formData.title.trim()) return;

    try {
      const res = await apiFetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assignees: formData.selectedAssignees
        })
      });

      if (res.ok) {
        toast.success(t("updatedSuccess") || "Tapşırıq yeniləndi");
        setShowEditModal(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        toast.error(t("updatedFailed") || "Tapşırığı yeniləmək mümkün olmadı");
      }
    } catch (error) {
      toast.error(c("errors.unexpected") || "Gözlənilməz xəta baş verdi");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setActiveMenuTaskId(null);
    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success(t("deletedSuccess") || "Tapşırıq silindi");
      } else {
        toast.error(t("deletedFailed") || "Tapşırığı silmək mümkün olmadı");
      }
    } catch (error) {
      toast.error(c("errors.unexpected") || "Gözlənilməz xəta baş verdi");
    }
  };

  const getDueDateDisplay = (task: KanbanTask) => {
    const raw = task.due_date || task.dueDate || task.deadline;
    if (!raw) return null;
    try {
      const d = new Date(raw);
      return !isNaN(d.getTime()) ? d.toLocaleDateString() : null;
    } catch {
      return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title") || "Tapşırıqlar"}</h1>
          <p className={styles.subtitle}>
            {isSuperAdmin 
              ? "Bütün komandanın daxili iş axını və tapşırıqları" 
              : "Sizə təyin olunmuş daxili tapşırıqlar"}
          </p>
        </div>
        {canCreate && (
          <button className={styles.addBtn} onClick={openCreateModal}>
            <Plus size={18} /> {t("newTask") || "Yeni Tapşırıq"}
          </button>
        )}
      </div>

      {/* Modern Filter Container */}
      <div className={styles.filterContainer}>
        <div className={styles.filterTopRow}>
          <div className={styles.searchFilter}>
            <Search size={16} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder") || "Tapşırıq axtar..."} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {!isSuperAdmin && (
            <div style={{
              background: "rgba(0, 196, 181, 0.12)",
              color: "var(--aqua-teal, #00C4B5)",
              border: "1px solid rgba(0, 196, 181, 0.25)",
              padding: "0.45rem 1rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 600
            }}>
              {t("myTasksOnly") || "Mənə aid tapşırıqlar"} ({filteredTasks.length})
            </div>
          )}

          {isSuperAdmin && selectedAssigneeFilters.length > 0 && (
            <button className={styles.filterClearBtn} onClick={handleSelectAll}>
              {t("resetFilters") || "Seçimləri sıfırla"} ({selectedAssigneeFilters.length})
            </button>
          )}
        </div>

        {/* SuperAdmin Multi-Assignee Filter Chips */}
        {isSuperAdmin && (
          <div className={styles.filterChipsScroll}>
            {/* Show All Persons Button */}
            <div 
              className={`${styles.filterChip} ${styles.filterChipAll} ${selectedAssigneeFilters.length === 0 ? styles.filterChipActive : ""}`}
              onClick={handleSelectAll}
            >
              <Users size={14} />
              <span>{t("allPeople") || "👥 Bütün Şəxsləri Göstər (Hamısı)"}</span>
            </div>

            {/* Individual Staff Chips */}
            {staffUsers.map(user => {
              const isSelected = selectedAssigneeFilters.includes(user.id);
              return (
                <div
                  key={user.id}
                  className={`${styles.filterChip} ${isSelected ? styles.filterChipActive : ""}`}
                  onClick={() => handleToggleAssigneeFilter(user.id)}
                  title={`${user.name} (${user.role})`}
                >
                  <span className={styles.userAvatarMini}>{getInitial(user?.name)}</span>
                  <span>{user.name}</span>
                  {isSelected && <Check size={13} color="var(--aqua-teal, #00C4B5)" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Column Tab Selector */}
      <div className={styles.mobileColumnSelector}>
        {COLUMNS.map(col => {
          const count = filteredTasks.filter(t => t && t.status === col.id).length;
          const isActive = mobileActiveColumn === col.id;
          return (
            <button
              key={col.id}
              type="button"
              className={`${styles.mobileColBtn} ${isActive ? styles.mobileColBtnActive : ""}`}
              onClick={() => setMobileActiveColumn(col.id)}
              style={{ borderBottomColor: isActive ? col.color : "transparent" }}
            >
              <span className={styles.mobileColTitle}>{col.title}</span>
              <span className={styles.mobileColCount} style={{ backgroundColor: `${col.color}25`, color: col.color }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.kanbanBoard}>
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t && t.status === col.id);
          const isMobileActive = mobileActiveColumn === col.id;
          return (
            <div
              key={col.id}
              className={`${styles.column} ${isMobileActive ? styles.columnMobileActive : ""} ${dragOverColId === col.id ? styles.columnOver : ""}`}
              onDrop={e => handleDrop(e, col.id)}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={e => {
                if (e.currentTarget === e.target) setDragOverColId(null);
              }}
            >
              <div className={styles.columnHeader}>
                <div className={styles.colIndicator} style={{ backgroundColor: col.color }}></div>
                <h3>{col.title}</h3>
                <span className={styles.count}>{colTasks.length}</span>
              </div>

              <div className={styles.taskList}>
                {loading ? (
                  <div className={styles.loadingState}>
                    <p>{t("loading")}</p>
                  </div>
                ) : colTasks.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    <p>{t("empty")}</p>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const dueDateDisplay = getDueDateDisplay(task);
                    const isMenuOpen = activeMenuTaskId === task.id;
                    const assignees = Array.isArray(task.assignees) ? task.assignees : [];

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`${styles.card} ${draggedTaskId === task.id ? styles.cardDragging : ""}`}
                        onClick={() => {
                          if (isDraggingRef.current) return;
                          setViewingTask(task);
                        }}
                        style={{ cursor: "grab" }}
                      >
                        <div className={styles.cardHeader}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <div className={styles.dragHandle} title="Drag">
                              <GripVertical size={16} />
                            </div>
                            <div
                              className={styles.priorityBadge}
                              style={{
                                color: getPriorityColor(task.priority),
                                backgroundColor: `${getPriorityColor(task.priority)}1A`
                              }}
                            >
                              <Flag size={12} /> {t(`priorities.${task.priority.toLowerCase()}`) || task.priority}
                            </div>
                          </div>

                          <div className={styles.cardHeaderRight} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <select
                              className={styles.quickStatusSelect}
                              value={task.status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                e.stopPropagation();
                                handleDirectStatusChange(task.id, e.target.value as any);
                              }}
                              title="Status"
                            >
                              <option value="TODO">{t("columns.TODO")}</option>
                              <option value="IN_PROGRESS">{t("columns.IN_PROGRESS")}</option>
                              <option value="REVIEW">{t("columns.REVIEW")}</option>
                              <option value="DONE">{t("columns.DONE")}</option>
                            </select>

                            <button
                              className={styles.moreBtn}
                              onClick={e => {
                                e.stopPropagation();
                                setActiveMenuTaskId(isMenuOpen ? null : task.id);
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {isMenuOpen && (
                              <div className={styles.dropdownMenu} onClick={e => e.stopPropagation()}>
                                <button
                                  className={styles.dropdownItem}
                                  onClick={() => openEditModal(task)}
                                >
                                  <Edit2 size={14} /> Redaktə et
                                </button>
                                <button
                                  className={`${styles.dropdownItem} ${styles.deleteDropdownItem}`}
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 size={14} /> Sil
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h4 className={styles.taskTitle}>{task.title}</h4>
                        {task.description && <p className={styles.taskDesc}>{task.description}</p>}

                        <div className={styles.cardFooter}>
                          <div className={styles.assigneesWrapper}>
                            {assignees.length === 0 ? (
                              <div className={styles.assigneeChip}>
                                <User size={13} />
                                <span style={{ opacity: 0.6 }}>{t("unassigned") || "Təyin edilməyib"}</span>
                              </div>
                            ) : (
                              assignees.map((a, idx) => (
                                <div key={a.id || idx} className={styles.assigneeChip} title={a.name}>
                                  <span className={styles.userAvatarMini}>
                                    {getInitial(a?.name)}
                                  </span>
                                  <span>{a.name}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {dueDateDisplay && (
                            <div className={styles.deadline}>
                              <Calendar size={14} />
                              <span>{dueDateDisplay}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t("newTask")}</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>{t("form.title")}</label>
                <input
                  required
                  type="text"
                  placeholder={t("form.titlePlaceholder")}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>{t("form.description")}</label>
                <textarea
                  placeholder={t("form.descPlaceholder")}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>{t("form.status")}</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="TODO">{t("columns.TODO")}</option>
                    <option value="IN_PROGRESS">{t("columns.IN_PROGRESS")}</option>
                    <option value="REVIEW">{t("columns.REVIEW")}</option>
                    <option value="DONE">{t("columns.DONE")}</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("form.priority")}</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="LOW">{t("priorities.low")}</option>
                    <option value="MEDIUM">{t("priorities.medium")}</option>
                    <option value="HIGH">{t("priorities.high")}</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{t("form.dueDate")}</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>İcraçılar (Bir və ya bir neçə işçi seçin)</label>
                <div className={styles.multiUserPicker}>
                  {staffUsers.map(user => {
                    const isSelected = formData.selectedAssignees.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`${styles.userOptionChip} ${isSelected ? styles.userOptionActive : ""}`}
                        onClick={() => toggleAssignee(user.id)}
                      >
                        <span className={styles.userAvatarMini}>{getInitial(user?.name)}</span>
                        <span>{user.name}</span>
                        {isSelected && <Check size={14} color="var(--aqua-teal, #00C4B5)" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                  Ləğv et
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Tapşırığı Redaktə Et</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>{t("form.title")}</label>
                <input
                  required
                  type="text"
                  placeholder={t("form.titlePlaceholder")}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>{t("form.description")}</label>
                <textarea
                  placeholder={t("form.descPlaceholder")}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>{t("form.status")}</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="TODO">{t("columns.TODO")}</option>
                    <option value="IN_PROGRESS">{t("columns.IN_PROGRESS")}</option>
                    <option value="REVIEW">{t("columns.REVIEW")}</option>
                    <option value="DONE">{t("columns.DONE")}</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t("form.priority")}</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="LOW">{t("priorities.low")}</option>
                    <option value="MEDIUM">{t("priorities.medium")}</option>
                    <option value="HIGH">{t("priorities.high")}</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{t("form.dueDate")}</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>{t("form.assignedTo")}</label>
                <div className={styles.multiUserPicker}>
                  {staffUsers.map(user => {
                    const isSelected = formData.selectedAssignees.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`${styles.userOptionChip} ${isSelected ? styles.userOptionActive : ""}`}
                        onClick={() => toggleAssignee(user.id)}
                      >
                        <span className={styles.userAvatarMini}>{getInitial(user?.name)}</span>
                        <span>{user.name}</span>
                        {isSelected && <Check size={14} color="var(--aqua-teal, #00C4B5)" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                  {t("form.cancel")}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {t("form.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {viewingTask && (
        <div className={styles.modalOverlay} onClick={() => setViewingTask(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Tapşırıq Detalları</h2>
              <button className={styles.closeModalBtn} onClick={() => setViewingTask(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.detailBody}>
              <div className={styles.detailGroup}>
                <div className={styles.detailLabel}>Başlıq</div>
                <div className={styles.detailValue} style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                  {viewingTask.title}
                </div>
              </div>

              {viewingTask.description && (
                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Təsvir</div>
                  <div className={styles.detailValue} style={{ whiteSpace: "pre-wrap" }}>
                    {viewingTask.description}
                  </div>
                </div>
              )}

              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Status</div>
                  <div
                    className={styles.detailBadge}
                    style={{
                      backgroundColor: `${COLUMNS.find(c => c.id === viewingTask.status)?.color || "#64748b"}26`,
                      color: COLUMNS.find(c => c.id === viewingTask.status)?.color || "#64748b"
                    }}
                  >
                    {COLUMNS.find(c => c.id === viewingTask.status)?.title || viewingTask.status}
                  </div>
                </div>

                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Prioritet</div>
                  <div
                    className={styles.detailBadge}
                    style={{
                      backgroundColor: `${getPriorityColor(viewingTask.priority)}26`,
                      color: getPriorityColor(viewingTask.priority)
                    }}
                  >
                    {viewingTask.priority}
                  </div>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>İcraçılar</div>
                  <div className={styles.assigneesWrapper} style={{ marginTop: "0.25rem" }}>
                    {Array.isArray(viewingTask.assignees) && viewingTask.assignees.length > 0 ? (
                      viewingTask.assignees.map((a, idx) => (
                        <div key={a.id || idx} className={styles.assigneeChip}>
                          <span className={styles.userAvatarMini}>{getInitial(a?.name)}</span>
                          <span>{a.name}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ opacity: 0.6, fontSize: "0.9rem" }}>Təyin edilməyib</span>
                    )}
                  </div>
                </div>

                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Bitmə Tarixi</div>
                  <div className={styles.detailValue}>
                    {getDueDateDisplay(viewingTask) || "Təyin edilməyib"}
                  </div>
                </div>
              </div>

              <div className={styles.modalActions} style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    const t = viewingTask;
                    setViewingTask(null);
                    openEditModal(t);
                  }}
                >
                  <Edit2 size={15} style={{ marginRight: 6 }} /> Redaktə Et
                </button>
                <button type="button" className={styles.saveBtn} onClick={() => setViewingTask(null)}>
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
