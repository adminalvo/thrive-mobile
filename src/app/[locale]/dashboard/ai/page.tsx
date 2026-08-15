"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  Paperclip, 
  Trash2, 
  Sparkles, 
  Loader2, 
  X, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./page.module.css";

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

export default function AiDashboardPage() {
  const t = useTranslations("AiPage");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
  }, [messages, selectedImage]);

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
      recognition.continuous = false;

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

  // Image file handler
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

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setSelectedImage(null);
  };

  const executeSend = async (messageText: string, imageUri: string | null = null) => {
    if ((!messageText.trim() && !imageUri) || loading) return;

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
    if (imageUri) {
      userContent = [
        { type: "text", text: messageText.trim() || t("imageAttached") },
        { type: "image_url", image_url: { url: imageUri } }
      ];
    } else {
      userContent = messageText.trim();
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
        setMessages(prev => [...prev, { role: "assistant", content: t("errorOccurred") }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: t("networkError") }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(input, selectedImage);
  };

  const handleSuggestion = (prompt: string) => {
    executeSend(prompt, null);
  };

  const suggestions = [
    t("suggestion1"),
    t("suggestion2"),
    t("suggestion3"),
    t("suggestion4")
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.botAvatar}>
            <Bot size={24} />
          </div>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>
              {t("title")}
              <span className={styles.statusBadge}>
                <span className={styles.statusDot} />
                Online
              </span>
            </h1>
            <p className={styles.subtitle}>{t("subtitle")}</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button 
            type="button" 
            onClick={clearChat}
            className={styles.clearBtn}
            title={t("clearChat")}
          >
            <Trash2 size={15} />
            <span>{t("clearChat")}</span>
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.emptyState}
          >
            <div className={styles.emptyIcon}>
              <Sparkles size={32} />
            </div>
            <h2 className={styles.emptyTitle}>{t("title")}</h2>
            <p className={styles.emptySubtitle}>{t("subtitle")}</p>

            <div className={styles.suggestionsGrid}>
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx} 
                  className={styles.suggestionCard}
                  onClick={() => handleSuggestion(sug)}
                >
                  <span>{sug}</span>
                  <ArrowRight size={15} color="var(--aqua-teal)" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`${styles.messageRow} ${m.role === "user" ? styles.messageRowUser : ""}`}
              >
                <div className={`${styles.avatar} ${m.role === "user" ? styles.avatarUser : styles.avatarAssistant}`}>
                  {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}`}>
                  {typeof m.content === "string" ? (
                    m.content
                  ) : Array.isArray(m.content) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
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
                              className={styles.attachedImg}
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
              <div className={styles.loaderRow}>
                <div className={`${styles.avatar} ${styles.avatarAssistant}`}>
                  <Bot size={18} />
                </div>
                <div style={{ padding: "0.5rem", color: "var(--aqua-teal)" }}>
                  <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Image Preview Tray */}
      {selectedImage && (
        <div className={styles.imagePreviewTray}>
          <div className={styles.previewThumbContainer}>
            <img src={selectedImage} alt="Thumbnail preview" className={styles.previewThumb} />
            <button 
              type="button" 
              onClick={handleRemoveImage}
              className={styles.removeThumbBtn}
              title="Remove image"
            >
              <X size={12} />
            </button>
          </div>
          <span className={styles.previewText}>{t("imageAttached")}</span>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={sendMessage} className={styles.inputForm}>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleImageSelect} 
          style={{ display: "none" }} 
        />

        {/* Paperclip / Image Attachment */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className={styles.actionBtn}
          title="Attach Image"
          style={selectedImage ? { color: "var(--aqua-teal)", borderColor: "var(--aqua-teal)" } : {}}
        >
          <Paperclip size={18} />
        </button>

        {/* Microphone Dictation Button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={loading}
          className={`${styles.actionBtn} ${isRecording ? styles.actionBtnActive : ""}`}
          title={isRecording ? "Stop dictation" : "Voice dictation"}
        >
          <Mic size={18} />
        </button>

        {/* Input */}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isRecording ? t("listening") : t("placeholder")}
          disabled={loading}
          className={styles.inputField}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={loading || (!input.trim() && !selectedImage)}
          className={styles.sendBtn}
          title={t("send")}
        >
          <Send size={18} />
        </button>
      </form>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulseRed {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />
    </div>
  );
}
