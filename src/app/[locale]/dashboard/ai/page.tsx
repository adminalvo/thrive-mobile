"use client";

import { useState, useRef, useEffect } from "react";
import { 
  User, 
  Send, 
  Paperclip, 
  Trash2, 
  Loader2, 
  X, 
  ChevronRight,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Brain
} from "lucide-react";
import { useLocale } from "next-intl";
import styles from "./page.module.css";
import { FormattedMarkdown } from "@/components/FormattedMarkdown";

export interface MessageContentText {
  type: "text";
  text: string;
}

export interface MessageContentImage {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export type MessageContentPart = MessageContentText | MessageContentImage;
export type MessageContent = string | MessageContentPart[];

export interface ChatMessage {
  id?: string;
  role: "assistant" | "user" | "system";
  content: MessageContent;
  reasoning?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export default function AiDashboardPage() {
  const locale = useLocale();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);

  // Dynamic Thinking Progress State
  const [thinkingElapsed, setThinkingElapsed] = useState(0);
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0);

  const thinkingStepsMap: Record<string, string[]> = {
    az: [
      "Sorğu təhlil edilir...",
      "Düşünürəm, məntiqi struktur qurulur...",
      "CRM məlumat bazası və qeydlər araşdırılır...",
      "Ən optimal cavab və tövsiyələr hazırlanır...",
      "Nəticə formalaşdırılır və yekunlaşdırılır..."
    ],
    en: [
      "Analyzing request...",
      "Thinking and synthesizing context...",
      "Querying CRM records and database...",
      "Formulating the most optimal response...",
      "Finalizing structured answer..."
    ],
    ru: [
      "Анализирую запрос...",
      "Размышляю и выстраиваю логику...",
      "Проверяю данные и записи в CRM...",
      "Формирую наиболее точный ответ...",
      "Завершаю подготовку ответа..."
    ]
  };

  const currentSteps = thinkingStepsMap[locale] || thinkingStepsMap.az;
  const currentThinkingText = currentSteps[Math.min(thinkingStepIndex, currentSteps.length - 1)];

  useEffect(() => {
    let timer: any;
    let stepTimer: any;

    if (loading) {
      setThinkingElapsed(0);
      setThinkingStepIndex(0);
      const start = Date.now();

      timer = setInterval(() => {
        setThinkingElapsed(Math.floor((Date.now() - start) / 100) / 10);
      }, 100);

      stepTimer = setInterval(() => {
        setThinkingStepIndex(prev => (prev < 4 ? prev + 1 : prev));
      }, 2000);
    } else {
      setThinkingElapsed(0);
      setThinkingStepIndex(0);
    }

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [loading]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedImage]);

  // Load chat sessions from API on mount
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch("/api/ai/sessions");
      if (res.ok) {
        const data: ChatSession[] = await res.json();
        setSessions(data);

        // Restore active session if exists
        const savedSessionId = localStorage.getItem("thrive_active_ai_session");
        if (savedSessionId && data.some(s => s.id === savedSessionId)) {
          loadSession(savedSessionId);
        } else if (data.length > 0 && !currentSessionId) {
          loadSession(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Load messages for a specific session
  const loadSession = async (sessionId: string) => {
    try {
      setCurrentSessionId(sessionId);
      localStorage.setItem("thrive_active_ai_session", sessionId);
      const res = await fetch(`/api/ai/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        const loadedMessages: ChatMessage[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content
        }));
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    }
  };

  // Start a new chat session
  const startNewChat = async () => {
    try {
      const res = await fetch("/api/ai/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Conversation"
        })
      });
      if (res.ok) {
        const newSession: ChatSession = await res.json();
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        localStorage.setItem("thrive_active_ai_session", newSession.id);
        setMessages([]);
        setInput("");
        setSelectedImage(null);
      }
    } catch (err) {
      console.error("Failed to start new chat:", err);
    }
  };

  // Delete a chat session
  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/sessions/${sessionId}`, { method: "DELETE" });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        localStorage.removeItem("thrive_active_ai_session");
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Handle image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  // Send message to AI
  const executeSend = async (messageText: string, imageUri: string | null = null) => {
    if ((!messageText.trim() && !imageUri) || loading) return;

    let userContent: MessageContent;
    if (imageUri) {
      userContent = [
        { type: "text", text: messageText.trim() || "Image attached" },
        { type: "image_url", image_url: { url: imageUri } }
      ];
    } else {
      userContent = messageText.trim();
    }

    const userMsg: ChatMessage = { role: "user", content: userContent };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          sessionId: currentSessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "AI could not generate response");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content || "No response received.",
        reasoning: data.reasoning || null
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If a new session was created on backend, update local session tracking
      if (data.sessionId && data.sessionId !== currentSessionId) {
        setCurrentSessionId(data.sessionId);
        localStorage.setItem("thrive_active_ai_session", data.sessionId);
        fetchSessions();
      } else {
        fetchSessions();
      }
    } catch (err: any) {
      console.error("AI send error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error occurred: ${err.message || "Unknown error"}. Please try again.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeSend(input, selectedImage);
    }
  };

  // Filtered sessions for sidebar search
  const filteredSessions = sessions.filter(s => {
    return !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={styles.container}>
      {/* --- Left Sidebar: Chat History --- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button className={styles.newChatBtn} onClick={startNewChat}>
            <Plus size={18} />
            <span>New Conversation</span>
          </button>

          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={15} />
            <input
              type="text"
              placeholder="Search conversations..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sessions History List */}
        <div className={styles.sessionList}>
          {loadingSessions ? (
            <div className={styles.emptySessions}>
              <Loader2 className="animate-spin" size={20} />
              <span style={{ marginTop: "0.5rem" }}>Loading history...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className={styles.emptySessions}>
              <MessageSquare size={28} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
              <span>No conversations found</span>
            </div>
          ) : (
            filteredSessions.map(s => (
              <div
                key={s.id}
                className={`${styles.sessionItem} ${currentSessionId === s.id ? styles.activeSessionItem : ""}`}
                onClick={() => loadSession(s.id)}
              >
                <div className={styles.sessionContent}>
                  <div className={styles.sessionTitle}>{s.title}</div>
                  <div className={styles.sessionMeta}>
                    <span>{new Date(s.updated_at || s.created_at).toLocaleDateString()}</span>
                    {s.message_count ? <span>• {s.message_count} messages</span> : null}
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={e => deleteSession(e, s.id)}
                  title="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* --- Main Chat Canvas --- */}
      <section className={styles.mainChat}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.botLogoWrapper}>
              <img src="/ai-icon.png" alt="ThrAIve Logo" className={styles.botLogoImg} />
            </div>
            <div className={styles.titleGroup}>
              <h1 className={styles.title}>
                <span>ThrAIve</span>
                <span className={styles.modelBadge}>HacTag Gamma A5 • v1.0.0</span>
              </h1>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot}></span>
                <span>Full System Integration Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.welcomeState}>
              <div className={styles.welcomeLogo}>
                <img src="/ai-icon.png" alt="ThrAIve Logo" className={styles.welcomeLogoImg} />
              </div>
              <h2 className={styles.welcomeTitle}>How can I help you today?</h2>
              <p className={styles.welcomeDesc}>
                Powered by <strong>HacTag Development Gamma A5</strong>. I can register students (individually or in bulk), calculate financial analytics, organize teachers, manage groups, and run CRM operations.
              </p>

              <div className={styles.suggestionsGrid}>
                <button 
                  className={styles.suggestionCard}
                  onClick={() => executeSend("Add these students in bulk: John Doe 0501234567 SAT $200, Jane Smith 0559876543 IELTS $180")}
                >
                  <span>👥 Bulk Student Registration</span>
                  <ChevronRight size={14} />
                </button>
                <button 
                  className={styles.suggestionCard}
                  onClick={() => executeSend("Show current monthly revenue, expenses, and outstanding debts")}
                >
                  <span>💰 Financial Overview & Debts</span>
                  <ChevronRight size={14} />
                </button>
                <button 
                  className={styles.suggestionCard}
                  onClick={() => executeSend("List all registered teachers and their assigned subjects")}
                >
                  <span>👨‍🏫 Teachers & Programs</span>
                  <ChevronRight size={14} />
                </button>
                <button 
                  className={styles.suggestionCard}
                  onClick={() => executeSend("Create a new sales lead: Alex Turner 0702223344 Instagram")}
                >
                  <span>📈 Create New Lead</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id || index}
                  className={`${styles.messageRow} ${isUser ? styles.userRow : styles.assistantRow}`}
                >
                  <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.assistantAvatar}`}>
                    {isUser ? (
                      <User size={18} />
                    ) : (
                      <img src="/ai-icon.png" alt="AI Avatar" className={styles.assistantAvatarImg} />
                    )}
                  </div>
                  <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
                    {!isUser && msg.reasoning && (
                      <details className={styles.reasoningDetails}>
                        <summary className={styles.reasoningSummary}>
                          <span>🧠 Düşüncə prosesi (Reasoning)</span>
                        </summary>
                        <div className={styles.reasoningBody}>
                          {msg.reasoning}
                        </div>
                      </details>
                    )}

                    {typeof msg.content === "string" ? (
                      <FormattedMarkdown content={msg.content} />
                    ) : (
                      <div>
                        {msg.content.map((part, pIdx) => {
                          if (part.type === "text") return <FormattedMarkdown key={pIdx} content={part.text} />;
                          if (part.type === "image_url") {
                            return (
                              <img
                                key={pIdx}
                                src={part.image_url.url}
                                alt="Attachment"
                                style={{ maxWidth: "220px", borderRadius: "8px", marginTop: "0.5rem" }}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className={`${styles.messageRow} ${styles.assistantRow}`}>
              <div className={`${styles.avatar} ${styles.assistantAvatar}`}>
                <img src="/ai-icon.png" alt="AI Avatar" className={styles.assistantAvatarImg} />
              </div>
              <div className={styles.thinkingBubble}>
                <div className={styles.thinkingProgressWrapper}>
                  <div className={styles.thinkingHeader}>
                    <Sparkles className={styles.neuralIcon} size={15} />
                    <span className={styles.thinkingStepText}>
                      {currentThinkingText}
                    </span>
                  </div>
                  <span className={styles.thinkingTimerBadge}>
                    {thinkingElapsed.toFixed(1)}s
                  </span>
                </div>
                <div className={styles.thinkingSubBar}>
                  <div className={styles.thinkingSubBarFill} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className={styles.inputArea}>
          {selectedImage && (
            <div className={styles.imagePreview}>
              <img src={selectedImage} alt="Selected preview" className={styles.previewImg} />
              <button className={styles.removeImageBtn} onClick={handleRemoveImage}>
                <X size={12} />
              </button>
            </div>
          )}

          <div className={styles.inputWrapper}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageSelect}
            />

            <button
              className={styles.actionBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              className={styles.textInput}
              placeholder="Ask Gamma A5 or enter student, teacher, group commands..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              className={`${styles.actionBtn} ${styles.sendBtn}`}
              onClick={() => executeSend(input, selectedImage)}
              disabled={(!input.trim() && !selectedImage) || loading}
              title="Send message"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
