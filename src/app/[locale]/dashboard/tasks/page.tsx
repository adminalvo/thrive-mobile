"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { Plus, MoreVertical, Calendar, Flag, User, X, Edit2, Trash2, Search, Check, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function TasksPage() {
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
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const permissions = (session?.user as any)?.permissions?.tasks || {};
  const canCreate = userRole === "super_admin" || userRole === "admin" || permissions.create;

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
        setTasks(data);
      } else {
        toast.error("Tapşırıqları yükləmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
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
      console.error(e);
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

  // Filter tasks by Assignee & Search
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery.trim() || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedAssigneeFilter === "all") return true;

      // Check if user is in assignees list
      const hasAssignee = task.assignees?.some(a => a.id === selectedAssigneeFilter || a.name === selectedAssigneeFilter);
      return hasAssignee;
    });
  }, [tasks, selectedAssigneeFilter, searchQuery]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: KanbanTask["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (error) {
      toast.error("Tapşırıq statusunu dəyişmək mümkün olmadı");
      fetchTasks();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
    const formattedDate = dateVal ? new Date(dateVal).toISOString().split("T")[0] : "";
    
    const currentAssigneeIds = task.assignees?.map(a => a.id) || [];

    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
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
      toast.error("Zəhmət olmasa başlıq daxil edin");
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
        toast.success("Tapşırıq uğurla yaradıldı");
        setShowCreateModal(false);
        fetchTasks();
      } else {
        toast.error("Tapşırıq yaratmaq mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    if (!formData.title.trim()) {
      toast.error("Zəhmət olmasa başlıq daxil edin");
      return;
    }

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
        toast.success("Tapşırıq yeniləndi");
        setShowEditModal(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        toast.error("Tapşırığı yeniləmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setActiveMenuTaskId(null);
    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success("Tapşırıq silindi");
      } else {
        toast.error("Tapşırığı silmək mümkün olmadı");
      }
    } catch (error) {
      toast.error("Gözlənilməz xəta baş verdi");
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "HIGH") return "#ef4444";
    if (priority === "MEDIUM") return "#f59e0b";
    return "#3b82f6";
  };

  const getDueDateDisplay = (task: KanbanTask) => {
    const raw = task.due_date || task.dueDate || task.deadline;
    if (!raw) return null;
    try {
      return raw ? new Date(raw).toLocaleDateString() : "-";
    } catch {
      return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title") || "Tapşırıqlar"}</h1>
          <p className={styles.subtitle}>{t("subtitle") || "Komandanın daxili iş axını və tapşırıqları"}</p>
        </div>
        {canCreate && (
          <button className={styles.addBtn} onClick={openCreateModal}>
            <Plus size={18} /> {t("newTask") || "Yeni Tapşırıq"}
          </button>
        )}
      </div>

      {/* Assignee Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchFilter}>
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Tapşırıq axtar..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {isSuperAdmin ? (
          <select 
            className={styles.filterSelect}
            value={selectedAssigneeFilter}
            onChange={e => setSelectedAssigneeFilter(e.target.value)}
          >
            <option value="all">Bütün İcraçılar (Hamısı)</option>
            {staffUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        ) : (
          <div style={{
            background: "rgba(0, 196, 181, 0.12)",
            color: "var(--aqua-teal, #00C4B5)",
            border: "1px solid rgba(0, 196, 181, 0.25)",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: 600
          }}>
            Mənə aid tapşırıqlar ({filteredTasks.length})
          </div>
        )}
      </div>

      <div className={styles.kanbanBoard}>
        {COLUMNS.map(col => (
          <div
            key={col.id}
            className={styles.column}
            onDrop={e => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <div className={styles.columnHeader}>
              <div className={styles.colIndicator} style={{ backgroundColor: col.color }}></div>
              <h3>{t(`columns.${col.id}`) || col.title}</h3>
              <span className={styles.count}>
                {filteredTasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div className={styles.columnBody}>
              {loading ? (
                <div className={styles.loading}>{c("loading") || "Yüklənir..."}</div>
              ) : (
                filteredTasks
                  .filter(t => t.status === col.id)
                  .map(task => {
                    const dueDateDisplay = getDueDateDisplay(task);
                    const isMenuOpen = activeMenuTaskId === task.id;
                    const assignees = task.assignees && task.assignees.length > 0 ? task.assignees : [];

                    return (
                      <motion.div
                        layout
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e as any, task.id)}
                        className={styles.card}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setViewingTask(task)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.cardHeader}>
                          <div
                            className={styles.priorityBadge}
                            style={{
                              color: getPriorityColor(task.priority),
                              backgroundColor: `${getPriorityColor(task.priority)}1A`
                            }}
                          >
                            <Flag size={12} /> {task.priority}
                          </div>

                          <div className={styles.cardHeaderRight}>
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
                                  <Edit2 size={14} /> {c("edit") || "Redaktə et"}
                                </button>
                                <button
                                  className={`${styles.dropdownItem} ${styles.deleteDropdownItem}`}
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 size={14} /> {c("delete") || "Sil"}
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
                                <span style={{ opacity: 0.6 }}>Təyin edilməyib</span>
                              </div>
                            ) : (
                              assignees.map(a => (
                                <div key={a.id} className={styles.assigneeChip} title={a.name}>
                                  <span className={styles.userAvatarMini}>
                                    {a.name.charAt(0)}
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
                      </motion.div>
                    );
                  })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Yeni Tapşırıq</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Başlıq *</label>
                <input
                  required
                  type="text"
                  placeholder="Başlıq..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Təsvir</label>
                <textarea
                  placeholder="Detallar..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="TODO">Gözləmədə</option>
                    <option value="IN_PROGRESS">İcrada</option>
                    <option value="REVIEW">Yoxlanışda</option>
                    <option value="DONE">Tamamlandı</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Prioritet</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="LOW">Aşağı</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksək</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Bitmə Tarixi</label>
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
                        <span className={styles.userAvatarMini}>{user.name.charAt(0)}</span>
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
                <label>Başlıq *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Təsvir</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="TODO">Gözləmədə</option>
                    <option value="IN_PROGRESS">İcrada</option>
                    <option value="REVIEW">Yoxlanışda</option>
                    <option value="DONE">Tamamlandı</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Prioritet</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="LOW">Aşağı</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksək</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Bitmə Tarixi</label>
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
                        <span className={styles.userAvatarMini}>{user.name.charAt(0)}</span>
                        <span>{user.name}</span>
                        {isSelected && <Check size={14} color="var(--aqua-teal, #00C4B5)" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                  Ləğv et
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Yadda saxla
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
                      backgroundColor: `${COLUMNS.find(c => c.id === viewingTask.status)?.color}26`,
                      color: COLUMNS.find(c => c.id === viewingTask.status)?.color
                    }}
                  >
                    {COLUMNS.find(c => c.id === viewingTask.status)?.title}
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
                    {viewingTask.assignees && viewingTask.assignees.length > 0 ? (
                      viewingTask.assignees.map(a => (
                        <div key={a.id} className={styles.assigneeChip}>
                          <span className={styles.userAvatarMini}>{a.name.charAt(0)}</span>
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
