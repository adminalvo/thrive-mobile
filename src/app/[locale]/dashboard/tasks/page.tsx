"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Plus, MoreVertical, Calendar, Flag, User, X, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";

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
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}



export default function TasksPage() {
  const t = useTranslations("Tasks");
  const c = useTranslations("Common");

  const COLUMNS: { id: KanbanTask["status"]; title: string; color: string }[] = [
    { id: "TODO", title: t("columns.TODO"), color: "#64748b" },
    { id: "IN_PROGRESS", title: t("columns.IN_PROGRESS"), color: "#3b82f6" },
    { id: "REVIEW", title: t("columns.REVIEW"), color: "#f59e0b" },
    { id: "DONE", title: t("columns.DONE"), color: "#10b981" }
  ];

  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userRole = session?.user?.role || "staff";
  const isSuperAdmin = userRole === 'super_admin';
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
    assignee: string;
  }>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    assignee: ""
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
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
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffUsers(data);
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
    // Supabase Realtime subscription
    const channel = supabase
      .channel('kanban-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kanban_tasks' },
        (payload) => {
          console.log('Realtime update:', payload);
          // Refetch everything or update state optimistically
          // The safest and easiest to keep order_index in sync is to refetch
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close card options dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuTaskId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: KanbanTask["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Optimistic UI update
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (error) {
      toast.error("Tapşırıq statusunu dəyişmək mümkün olmadı");
      fetchTasks(); // Revert on failure
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
      assignee: ""
    });
    setShowCreateModal(true);
  };

  const openEditModal = (task: KanbanTask) => {
    setEditingTask(task);
    const dateVal = task.due_date || task.dueDate || task.deadline;
    const formattedDate = dateVal ? new Date(dateVal).toISOString().split("T")[0] : "";
    const assigneeVal = typeof task.assignee === "object" ? task.assignee?.name || "" : task.assignee || "";

    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: formattedDate,
      assignee: assigneeVal
    });
    setShowEditModal(true);
    setActiveMenuTaskId(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Zəhmət olmasa başlıq daxil edin");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assignee: formData.assignee.trim() || null
        })
      });

      if (res.ok) {
        const created = await res.json();
        setTasks(prev => [created, ...prev]);
        setShowCreateModal(false);
        toast.success("Tapşırıq uğurla yaradıldı");
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
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assignee: formData.assignee.trim() || null
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        setShowEditModal(false);
        setEditingTask(null);
        toast.success("Tapşırıq yeniləndi");
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
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE"
      });

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
    return "#3b82f6"; // LOW
  };

  const formatAssignee = (assignee: any) => {
    if (!assignee) return t("unassigned");
    if (typeof assignee === "string") return assignee;
    if (typeof assignee === "object" && assignee.name) return assignee.name;
    return t("unassigned");
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
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        {canCreate && (
          <button className={styles.addBtn} onClick={openCreateModal}>
            <Plus size={18} /> {t("newTask")}
          </button>
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
              <h3>{t(`columns.${col.id}`)}</h3>
              <span className={styles.count}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div className={styles.columnBody}>
              {loading ? (
                <div className={styles.loading}>{c("loading")}</div>
              ) : (
                tasks
                  .filter(t => t.status === col.id)
                  .map(task => {
                    const dueDateDisplay = getDueDateDisplay(task);
                    const isMenuOpen = activeMenuTaskId === task.id;

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
                          <div className={styles.assignee}>
                            <User size={14} />
                            <span>{formatAssignee(task.assignee)}</span>
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
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value as KanbanTask["status"] })
                    }
                  >
                    <option value="TODO">{t("columns.TODO")}</option>
                    <option value="IN_PROGRESS">{t("columns.IN_PROGRESS")}</option>
                    <option value="REVIEW">{t("columns.REVIEW")}</option>
                    <option value="DONE">{t("columns.DONE")}</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Prioritet</label>
                  <select
                    value={formData.priority}
                    onChange={e =>
                      setFormData({ ...formData, priority: e.target.value as KanbanTask["priority"] })
                    }
                  >
                    <option value="LOW">Aşağı (LOW)</option>
                    <option value="MEDIUM">Orta (MEDIUM)</option>
                    <option value="HIGH">Yüksək (HIGH)</option>
                  </select>
                </div>
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>İcra Tarixi</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Məsul Şəxs</label>
                  <select
                    value={formData.assignee}
                    onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                  >
                    <option value="">-- Məsul Şəxs Seçin --</option>
                    {staffUsers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateModal(false)}
                >
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
              <h2>{t("modal.edit.title")}</h2>
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
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value as KanbanTask["status"] })
                    }
                  >
                    <option value="TODO">{t("columns.TODO")}</option>
                    <option value="IN_PROGRESS">{t("columns.IN_PROGRESS")}</option>
                    <option value="REVIEW">{t("columns.REVIEW")}</option>
                    <option value="DONE">{t("columns.DONE")}</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Prioritet</label>
                  <select
                    value={formData.priority}
                    onChange={e =>
                      setFormData({ ...formData, priority: e.target.value as KanbanTask["priority"] })
                    }
                  >
                    <option value="LOW">Aşağı (LOW)</option>
                    <option value="MEDIUM">Orta (MEDIUM)</option>
                    <option value="HIGH">Yüksək (HIGH)</option>
                  </select>
                </div>
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.inputGroup}>
                  <label>İcra Tarixi</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Məsul Şəxs</label>
                  <select
                    value={formData.assignee}
                    onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                  >
                    <option value="">-- Məsul Şəxs Seçin --</option>
                    {staffUsers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowEditModal(false)}
                >
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

      {/* View Task Modal */}
      {viewingTask && (
        <div className={styles.modalOverlay} onClick={() => setViewingTask(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t("detail.title") || "Detallı Baxış"}</h2>
              <button className={styles.closeModalBtn} onClick={() => setViewingTask(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{t("detail.taskTitle") || "Başlıq"}</span>
                <span className={styles.detailValue} style={{ fontSize: "1.1rem", fontWeight: 500 }}>{viewingTask.title}</span>
              </div>
              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{t("detail.description") || "Təsvir"}</span>
                <span className={styles.detailValue}>{viewingTask.description || t("detail.none")}</span>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.status") || "Status"}</span>
                  <span className={styles.detailValue}>{t(`columns.${viewingTask.status}`)}</span>
                </div>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.priority") || "Prioritet"}</span>
                  <span className={styles.detailBadge} style={{ 
                    color: getPriorityColor(viewingTask.priority), 
                    backgroundColor: `${getPriorityColor(viewingTask.priority)}1A` 
                  }}>
                    {viewingTask.priority}
                  </span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.assignee") || "İcraçı"}</span>
                  <span className={styles.detailValue}>{formatAssignee(viewingTask.assignee)}</span>
                </div>
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>{t("detail.date") || "Tarix"}</span>
                  <span className={styles.detailValue}>{getDueDateDisplay(viewingTask) || t("detail.none")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
