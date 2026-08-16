# Survey Report: AI Chatbot Architecture & Dashboard Implementation

## Executive Summary
This report provides a comprehensive architectural survey of `src/components/AiChatbot.tsx` and details the exact specifications, state management, event handlers, UI patterns, and API contracts required to enhance the chatbot component and implement the new dedicated AI Dashboard Page (`src/app/[locale]/dashboard/ai/page.tsx`).

---

## 1. Deep Dive: Current `src/components/AiChatbot.tsx` Architecture

### 1.1 File Overview
- **Path**: `src/components/AiChatbot.tsx` (243 lines, Client Component: `"use client"`).
- **Core Role**: Floating popup assistant widget present on pages, allowing users to interact with Thrive CRM's AI assistant via natural language.
- **Dependencies**:
  - `react`: `useState`, `useRef`, `useEffect`
  - `framer-motion`: `motion`, `AnimatePresence`
  - `lucide-react`: `MessageSquare`, `X`, `Send`, `Bot`, `User`, `Loader2`

### 1.2 Current State Management
| State Variable | Type | Initial Value | Purpose |
|---|---|---|---|
| `isOpen` | `boolean` | `false` | Controls whether the floating modal is expanded or collapsed into the FAB button |
| `messages` | `Array<{ role: string, content: string }>` | `[{ role: "assistant", content: "Salam! Mən Thrive CRM-in ağıllı köməkçisiyəm. Sizə necə kömək edə bilərəm?" }]` | Stores message history |
| `input` | `string` | `""` | Stores the active input text in the form input |
| `loading` | `boolean` | `false` | Tracks in-flight API requests to `/api/ai` and disables the submit button |
| `messagesEndRef` | `RefObject<HTMLDivElement>` | `useRef(null)` | Pinned anchor DOM node used for scrolling |

### 1.3 Current Event Handlers & Effects
1. **Auto-Scroll Effect (`useEffect`)**:
   - Triggers on `[messages, isOpen]`.
   - Calls `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })`.
2. **`sendMessage(e: React.FormEvent)`**:
   - Guards: `if (!input.trim() || loading) return;`
   - Appends user message: `{ role: "user", content: input }`.
   - Resets input: `setInput("")`.
   - Sets `loading = true`.
   - Sends `POST /api/ai` with JSON payload `{ messages: [...messages, userMessage] }`.
   - Parses JSON response `data.content` and appends `{ role: "assistant", content: data.content }`.
   - Gracefully handles error statuses and network exceptions with localized fallback strings.
   - Cleans up in `finally`: `setLoading(false)`.

### 1.4 Current UI & Styling Architecture
- **FAB (Trigger Button)**:
  - Fixed position: `bottom: 2rem; right: 2rem; z-index: 9999;`
  - 60x60px circle with `var(--aqua-teal)` background and glow shadow `rgba(76, 162, 181, 0.4)`.
  - Icon: `<MessageSquare size={28} />`.
- **Chat Window (Popup Modal)**:
  - Fixed position: `bottom: 2rem; right: 2rem; width: 350px; height: 500px; z-index: 10000;`
  - Glassmorphic card styling: `background: rgba(15, 23, 42, 0.95)`, `backdropFilter: blur(10px)`, `borderRadius: 16px`, `border: 1px solid rgba(255, 255, 255, 0.1)`.
  - Header: Bot icon + "Thrive AI" title + Close button (`X`).
  - Messages List: Scrollable container with avatar icons (`Bot` / `User`), differentiated bubble styling (User: `rgba(255, 255, 255, 0.1)`, Bot: `rgba(76, 162, 181, 0.15)`).
  - Input Footer: Text input field + Submit button with `Send` icon.

---

## 2. Detailed Technical Specifications for Features & Enhancements

### 2.1 Voice Input (Web Speech API)
- **API Interface**:
  - `window.SpeechRecognition` or `window.webkitSpeechRecognition`.
  - Must include SSR safety guard (`typeof window !== "undefined"`).
  - TypeScript interface declaration:
    ```typescript
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
    ```
- **State & Refs**:
  - `isListening: boolean` (default `false`)
  - `recognitionRef: useRef<any>(null)`
- **Behavior & Flow**:
  1. User clicks the microphone button.
  2. If already listening, invoke `recognitionRef.current?.stop()` and set `isListening(false)`.
  3. Otherwise, instantiate `new SpeechRecognition()`:
     - `recognition.continuous = false;` (or `true` with manual stop)
     - `recognition.interimResults = true;`
     - `recognition.lang = "az-AZ";` (supports Azerbaijani by default, fallback to system language)
     - On `result`: parse `event.results[0][0].transcript` and update `setInput(transcript)`.
     - On `end` / `error`: set `isListening(false)`.
     - Call `recognition.start()` and set `isListening(true)`.
- **Visual Indicators**:
  - `Mic` / `MicOff` icon from `lucide-react`.
  - When `isListening === true`:
    - Background or icon color turns red (`#ef4444`).
    - Pulsating animation (CSS `@keyframes pulse` or Framer Motion `scale: [1, 1.2, 1]`, `boxShadow: 0 0 12px rgba(239, 68, 68, 0.6)`).

### 2.2 Image Input & Multimodal OpenAI Vision Payload
- **File Upload Handler**:
  - Hidden `<input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />`.
  - Attachment button with `Paperclip` or `Image` icon from `lucide-react`.
- **State**:
  - `selectedImage: string | null` (Base64 data URL string `data:image/...;base64,...`)
- **FileReader Conversion**:
  ```typescript
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ""; // Reset input
  };
  ```
- **Preview UI**:
  - Displayed above the input bar when `selectedImage` is present.
  - Thumbnail (`48x48px` or `56x56px` with rounded corners `borderRadius: 8px`).
  - Dismiss 'X' button on top-right of thumbnail to invoke `setSelectedImage(null)`.
- **Payload Format in `sendMessage`**:
  - If `selectedImage` exists:
    ```typescript
    const content = [
      { type: "text", text: input },
      { type: "image_url", image_url: { url: selectedImage } }
    ];
    const userMessage = { role: "user", content };
    ```
  - If no image attached:
    ```typescript
    const userMessage = { role: "user", content: input };
    ```
  - Attachment cleared immediately: `setSelectedImage(null)`.
- **Rendering Sent Images in Message List**:
  - In `messages.map`:
    - Check if `Array.isArray(m.content)`:
      - Render text block for `{ type: "text", text }`.
      - Render `<img src={item.image_url.url} alt="Attached" className="..." />` for `{ type: "image_url", image_url }`.
    - If `typeof m.content === "string"`:
      - Render `{m.content}` directly.

### 2.3 Text Input, API Communication & Error Handling
- **API Target**: `POST /api/ai`
- **Request Headers**: `{ "Content-Type": "application/json" }`
- **Body**: `{ messages: [...messages, userMessage] }`
- **Response Handling**:
  - Supports standard JSON `{ content: string }`.
  - Non-200 responses return clean Azerbaijani error: `"Bağışlayın, xəta baş verdi. Zəhmət olmasa bir az sonra təkrar cəhd edin."`.
  - Network catch returns: `"Şəbəkə xətası baş verdi."`.

### 2.4 Message Types & Data Structures
```typescript
export interface VisionTextItem {
  type: "text";
  text: string;
}

export interface VisionImageItem {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export type MessageContentType = string | (VisionTextItem | VisionImageItem)[];

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: MessageContentType;
}
```

### 2.5 Clear Chat & Quick Prompts
- **Clear Chat**:
  - Reset `messages` to default initial assistant greeting.
  - Reset `input` and `selectedImage`.
- **Quick Prompts / Welcome Screen**:
  - Quick action chips for common CRM tasks:
    - `"📊 Maliyyə statistikasını göstər"`
    - `"👥 Son tələbələri göstər"`
    - `"👨‍🏫 Müəllimlərin siyahısı"`
    - `"➕ Yeni müraciət (Lead) yarat"`
  - Clicking a chip immediately sets the input or triggers `sendMessage`.

### 2.6 Auto-Scroll Behavior
- `messagesEndRef` attached at bottom of the message container.
- `useEffect` scrolls to bottom whenever `messages`, `loading`, or `selectedImage` change.

---

## 3. Dedicated AI Dashboard Page (`/dashboard/ai`) Design & Integration

### 3.1 Page Requirements
- **Route**: `src/app/[locale]/dashboard/ai/page.tsx`
- **Layout Model**:
  - Full-screen / large centered ChatGPT-like layout inside `DashboardLayout`.
  - Glassmorphic interface styled with CSS variables:
    - Background: `var(--glass-bg)` / `rgba(2, 6, 23, 0.7)`
    - Border: `var(--glass-border)` / `rgba(255, 255, 255, 0.1)`
    - Accents: `var(--aqua-teal)` (`#4ca2b5`), `var(--ocean-blue)` (`#003f82`)
  - Features:
    - Dedicated sidebar conversation / history panel or clean centered stream with header.
    - Large centered message container (`max-width: 900px`).
    - Floating / bottom-docked prompt input box with Voice dictation button, Attachment button, and Send button.
    - Quick prompt suggestion cards when chat history is empty or fresh.
    - Export / Clear chat action in top bar.
    - Multimodal image preview and voice pulsation.

### 3.2 Sidebar & Navigation Integration
- **File**: `src/app/[locale]/dashboard/layout.tsx`
- **Updates**:
  - Import `Bot` icon from `lucide-react`.
  - Add to `navItems`:
    ```typescript
    { name: t("ai") || "AI Köməkçi", href: "/dashboard/ai", icon: Bot }
    ```
- **Localization**:
  - `messages/az.json` -> `"Sidebar": { ..., "ai": "AI Köməkçi" }`
  - `messages/en.json` -> `"Sidebar": { ..., "ai": "AI Assistant" }`
  - `messages/ru.json` -> `"Sidebar": { ..., "ai": "AI Помощник" }`

---

## 4. Backend Capabilities & Tool Calling Reference (`/api/ai`)
- **Backend File**: `src/app/api/ai/route.ts`
- **Supported / Planned Tools**:
  1. `create_lead` (name, phone, email, source)
  2. `get_financial_stats` ()
  3. `create_teacher` (name, phone, email, subject, base_salary)
  4. `create_student` (first_name, last_name, phone, fin, grade, parent_phone)
  5. `create_group` (name, teacher_id, schedule, subject, price)
  6. `get_teachers` ()
  7. `get_students` ()
- **Model Fallback**:
  - Primary: `gemini-3.6-flash` via Google Generative Language OpenAI API.
  - Fallback: `openai/gpt-4o` via OpenRouter (`https://openrouter.ai/api/v1`).
