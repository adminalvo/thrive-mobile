"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, Mic, Paperclip, Image as ImageIcon } from "lucide-react";
import { usePathname } from "@/i18n/routing";

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
  role: "assistant" | "user" | "system";
  content: MessageContent;
}

export default function AiChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Salam! Mən Thrive CRM-in ağıllı köməkçisiyəm. Sizə necə kömək edə bilərəm?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, selectedImage]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Toggle speech recognition
  const toggleRecording = () => {
    if (typeof window === "undefined") return;

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Brauzeriniz səs tanıma (Speech Recognition) funksiyasını dəstəkləmir.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "az-AZ";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
    }
  };

  // Image Selection Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Zəhmət olmasa şəkil faylı seçin.");
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    }

    let userContent: MessageContent;
    if (selectedImage) {
      userContent = [
        { type: "text", text: input.trim() || "Şəkil əlavə edildi" },
        { type: "image_url", image_url: { url: selectedImage } }
      ];
    } else {
      userContent = input.trim();
    }

    const userMessage: ChatMessage = { role: "user", content: userContent };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Bağışlayın, xəta baş verdi. Zəhmət olmasa bir az sonra təkrar cəhd edin." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Şəbəkə xətası baş verdi." }]);
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
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chatbot"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          background: "var(--aqua-teal)",
          color: "white",
          border: "none",
          boxShadow: "0 10px 25px rgba(76, 162, 181, 0.4)",
          cursor: "pointer",
          display: isOpen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          transition: "transform 0.2s"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <MessageSquare size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              width: "360px",
              height: "520px",
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.55)",
              display: "flex",
              flexDirection: "column",
              zIndex: 10000,
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "0.85rem 1rem",
              background: "rgba(76, 162, 181, 0.12)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Bot size={20} color="var(--aqua-teal)" />
                <span style={{ fontWeight: 600, color: "white", fontSize: "0.95rem" }}>Thrive AI Köməkçi</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                aria-label="Close Chatbot"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  borderRadius: "6px"
                }}
              >
                <X size={18} />
              </button>
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
                    borderRadius: "14px",
                    background: m.role === "user" ? "rgba(255,255,255,0.15)" : "var(--aqua-teal)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {m.role === "user" ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                  </div>
                  <div style={{
                    background: m.role === "user" ? "rgba(76, 162, 181, 0.25)" : "rgba(255, 255, 255, 0.08)",
                    border: m.role === "user" ? "1px solid rgba(76, 162, 181, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "0.75rem 0.95rem",
                    borderRadius: "14px",
                    borderBottomRightRadius: m.role === "user" ? "2px" : "14px",
                    borderBottomLeftRadius: m.role === "assistant" ? "2px" : "14px",
                    color: "var(--text-primary)",
                    fontSize: "0.88rem",
                    maxWidth: "80%",
                    lineHeight: "1.4",
                    wordBreak: "break-word"
                  }}>
                    {typeof m.content === "string" ? (
                      m.content
                    ) : Array.isArray(m.content) ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {m.content.map((part, pIdx) => {
                          if (part.type === "text" && part.text) {
                            return <p key={pIdx} style={{ margin: 0 }}>{part.text}</p>;
                          }
                          if (part.type === "image_url" && part.image_url?.url) {
                            return (
                              <img
                                key={pIdx}
                                src={part.image_url.url}
                                alt="Attached content"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "160px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                  display: "block",
                                  border: "1px solid rgba(255, 255, 255, 0.15)"
                                }}
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
                    width: "28px", height: "28px", borderRadius: "14px",
                    background: "var(--aqua-teal)", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Bot size={14} color="white" />
                  </div>
                  <div style={{ padding: "0.5rem", color: "var(--aqua-teal)" }}>
                    <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Thumbnail Preview if Image Attached */}
            {selectedImage && (
              <div style={{
                padding: "0.5rem 1rem",
                background: "rgba(0, 0, 0, 0.3)",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <div style={{
                  position: "relative",
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--aqua-teal)"
                }}>
                  <img
                    src={selectedImage}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Şəkil əlavə edildi
                </span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={sendMessage} style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(10, 16, 30, 0.6)"
            }}>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />

              {/* Paperclip Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Şəkil əlavə et"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "16px",
                  background: selectedImage ? "rgba(76, 162, 181, 0.3)" : "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: selectedImage ? "var(--aqua-teal)" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: loading ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  transition: "all 0.2s"
                }}
              >
                <Paperclip size={16} />
              </button>

              {/* Microphone Dictation Button */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={loading}
                title={isRecording ? "Səsi dayandır" : "Səslə daxil et"}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "16px",
                  background: isRecording ? "#ef4444" : "rgba(255, 255, 255, 0.08)",
                  border: isRecording ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: isRecording ? "white" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: loading ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  animation: isRecording ? "pulseRed 1.5s infinite" : "none",
                  transition: "all 0.2s"
                }}
              >
                <Mic size={16} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isRecording ? "Dinlənilir..." : "Nəsə soruşun..."}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "18px",
                  padding: "0.5rem 0.85rem",
                  color: "white",
                  outline: "none",
                  fontSize: "0.88rem",
                  minWidth: 0
                }}
              />

              {/* Send Button */}
              <button 
                type="submit"
                disabled={loading || (!input.trim() && !selectedImage)}
                title="Göndər"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "17px",
                  background: "var(--aqua-teal)",
                  border: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: (loading || (!input.trim() && !selectedImage)) ? "not-allowed" : "pointer",
                  opacity: (loading || (!input.trim() && !selectedImage)) ? 0.4 : 1,
                  flexShrink: 0,
                  transition: "opacity 0.2s"
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulseRed {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.12); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />
    </>
  );
}
