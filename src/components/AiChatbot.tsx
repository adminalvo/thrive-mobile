"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Send, 
  User, 
  Loader2, 
  Paperclip, 
  Maximize2,
  Trash2
} from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";

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
}

export default function AiChatbot() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Restore messages and active session from localStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("thrive_active_ai_session");
      if (savedSession) {
        setSessionId(savedSession);
        fetch(`/api/ai/sessions/${savedSession}`)
          .then(res => res.json())
          .then(data => {
            if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages(data.messages);
            } else {
              setMessages([
                { 
                  role: "assistant", 
                  content: "Hello! I am ThrAIve — powered by Gamma A5 (v1.0.0) from HacTag Development. How can I help you today?" 
                }
              ]);
            }
          })
          .catch(() => {});
      } else {
        const savedMessages = localStorage.getItem("thrive_floating_ai_msgs");
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          setMessages([
            { 
              role: "assistant", 
              content: "Hello! I am ThrAIve — powered by Gamma A5 (v1.0.0) from HacTag Development. How can I help you today?" 
            }
          ]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save messages to localStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem("thrive_floating_ai_msgs", JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
    scrollToBottom();
  }, [messages, isOpen, selectedImage]);

  // Image Selection Handler
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

  const clearChat = () => {
    const defaultMsg: ChatMessage = {
      role: "assistant",
      content: "New conversation started. How can I help you today?"
    };
    setMessages([defaultMsg]);
    localStorage.removeItem("thrive_active_ai_session");
    localStorage.setItem("thrive_floating_ai_msgs", JSON.stringify([defaultMsg]));
    setSessionId(null);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    let userContent: MessageContent;
    if (selectedImage) {
      userContent = [
        { type: "text", text: input.trim() || "Image attached" },
        { type: "image_url", image_url: { url: selectedImage } }
      ];
    } else {
      userContent = input.trim();
    }

    const userMessage: ChatMessage = { role: "user", content: userContent };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updated,
          sessionId: sessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem("thrive_active_ai_session", data.sessionId);
        }
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ An error occurred. Please try again." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Network error occurred." }]);
    } finally {
      setLoading(false);
    }
  };

  // Hide the floating assistant when on dedicated AI page
  if (pathname?.includes("/dashboard/ai")) {
    return null;
  }

  return (
    <>
      {/* Floating launcher button with custom AI icon */}
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "58px",
          height: "58px",
          borderRadius: "18px",
          background: "#020c24",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 10px 30px rgba(2, 132, 199, 0.45), 0 0 20px rgba(2, 132, 199, 0.35)",
          cursor: "pointer",
          display: isOpen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 0,
          overflow: "hidden",
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <img 
          src="/ai-icon.png" 
          alt="AI Assistant" 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              width: "380px",
              height: "540px",
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.65)",
              display: "flex",
              flexDirection: "column",
              zIndex: 10000,
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "0.85rem 1rem",
              background: "rgba(2, 132, 199, 0.12)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "8px",
                  overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "#020c24"
                }}>
                  <img src="/ai-icon.png" alt="AI Icon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "white", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    ThrAIve
                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "10px", background: "rgba(14, 165, 233, 0.2)", color: "#38bdf8", border: "1px solid rgba(14, 165, 233, 0.3)" }}>
                      Gamma A5
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px"
                  }}
                >
                  <Trash2 size={15} />
                </button>

                <button
                  onClick={() => router.push("/dashboard/ai")}
                  title="Open full page"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px"
                  }}
                >
                  <Maximize2 size={15} />
                </button>

                <button 
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Assistant"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px"
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem"
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                  flexDirection: m.role === "user" ? "row-reverse" : "row"
                }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: m.role === "user" ? "linear-gradient(135deg, #6366f1, #a855f7)" : "#020c24",
                    border: m.role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden"
                  }}>
                    {m.role === "user" ? (
                      <User size={14} color="white" />
                    ) : (
                      <img src="/ai-icon.png" alt="Bot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{
                    background: m.role === "user" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "rgba(30, 41, 59, 0.7)",
                    border: m.role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "14px",
                    borderBottomRightRadius: m.role === "user" ? "2px" : "14px",
                    borderBottomLeftRadius: m.role === "assistant" ? "2px" : "14px",
                    color: "white",
                    fontSize: "0.85rem",
                    maxWidth: "80%",
                    lineHeight: "1.45",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap"
                  }}>
                    {typeof m.content === "string" ? (
                      m.content
                    ) : Array.isArray(m.content) ? (
                      <div>
                        {m.content.map((part, pIdx) => {
                          if (part.type === "text") return <div key={pIdx}>{part.text}</div>;
                          if (part.type === "image_url") {
                            return (
                              <img
                                key={pIdx}
                                src={part.image_url.url}
                                alt="Attachment"
                                style={{ maxWidth: "100%", maxHeight: "140px", borderRadius: "6px", marginTop: "0.35rem" }}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "8px",
                    overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "#020c24"
                  }}>
                    <img src="/ai-icon.png" alt="Bot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "0.4rem 0.6rem", color: "#38bdf8", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Gamma A5 is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Thumbnail Preview */}
            {selectedImage && (
              <div style={{
                padding: "0.4rem 0.8rem",
                background: "rgba(0, 0, 0, 0.4)",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden" }}>
                  <img src={selectedImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: "absolute", top: "1px", right: "1px",
                      background: "#ef4444", color: "white", border: "none",
                      borderRadius: "50%", width: "14px", height: "14px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", padding: 0
                    }}
                  >
                    <X size={8} />
                  </button>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Image attached</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={sendMessage} style={{
              padding: "0.65rem 0.85rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(10, 15, 30, 0.7)"
            }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Attach image"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: selectedImage ? "rgba(14, 165, 233, 0.3)" : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: selectedImage ? "#38bdf8" : "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                <Paperclip size={15} />
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Gamma A5..."
                disabled={loading}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "0.45rem 0.75rem",
                  color: "white",
                  outline: "none",
                  fontSize: "0.85rem"
                }}
              />

              <button 
                type="submit"
                disabled={loading || (!input.trim() && !selectedImage)}
                title="Send"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #0284c7, #2563eb)",
                  border: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: (loading || (!input.trim() && !selectedImage)) ? "not-allowed" : "pointer",
                  opacity: (loading || (!input.trim() && !selectedImage)) ? 0.4 : 1
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
