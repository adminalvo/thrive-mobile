# Investigation Report: `src/components/AiChatbot.tsx` Enhancements

## Executive Summary
This report presents an in-depth architectural and code-level investigation of `src/components/AiChatbot.tsx`. The component is a client-side floating AI assistant widget for Thrive CRM, communicating with `/api/ai`. We detail the current architecture and state model, followed by complete specifications and code blueprints for integrating:
1. **Voice Input** using `SpeechRecognition` / `webkitSpeechRecognition` with active recording states and pulsating mic visual indicator.
2. **Image Input** using a file picker (`Paperclip` icon), `FileReader` for Base64 conversion, thumbnail preview with removal button ('X').
3. **OpenAI Vision API Payload** handling in `sendMessage` (`content: [{ type: "text", text }, { type: "image_url", image_url: { url } }]`).
4. **Chat History Rendering** for multimodal messages (both string content and array parts containing images and text).

---

## 1. Current Architecture & State Management

### 1.1 Component Overview
- **File Location**: `src/components/AiChatbot.tsx` (243 lines)
- **Directive**: `"use client"` at line 1
- **Rendering Context**: Included globally in `src/app/[locale]/layout.tsx` (line 44) within `ThemeProvider` and `NextIntlClientProvider`.

### 1.2 State Variables (Lines 8–12)
| State Variable | Type | Default Value | Purpose |
|---|---|---|---|
| `isOpen` | `boolean` | `false` | Controls whether the chat popup dialog is open or collapsed into the floating launcher button. |
| `messages` | `Array<{ role: string, content: string }>` | Initial welcome message | Stores the list of conversation messages between the user and the assistant. |
| `input` | `string` | `""` | Stores current text in the chat input field. |
| `loading` | `boolean` | `false` | Indicates when an AI request is in-flight to `/api/ai`. Disables submission and shows a spinning loader. |
| `messagesEndRef` | `useRef<HTMLDivElement>(null)` | `null` | Reference to the dummy div at bottom of message list for auto-scrolling (`scrollIntoView({ behavior: "smooth" })`). |

### 1.3 Message Flow & Backend Interaction (Lines 22–49)
```typescript
const sendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || loading) return;

  const userMessage = { role: "user", content: input };
  setMessages(prev => [...prev, userMessage]);
  setInput("");
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
      setMessages(prev => [...prev, { role: "assistant", content: "Bağışlayın, xəta baş verdi..." }]);
    }
  } catch (error) {
    setMessages(prev => [...prev, { role: "assistant", content: "Şəbəkə xətası baş verdi." }]);
  } finally {
    setLoading(false);
  }
};
```
- **Backend API (`src/app/api/ai/route.ts`) Compatibility**:
  The backend accepts `{ messages: Array<any> }` and passes it directly to `client.chat.completions.create` (OpenAI format). Since OpenAI Vision format uses `content: [{ type: "text", text: "..." }, { type: "image_url", image_url: { url: "data:..." } }]`, the backend natively forwards this array structure without needing schema changes.

---

## 2. UI Elements, Icons & Styling

### 2.1 Icons Currently in Use
- Currently imported from `lucide-react` (line 5): `MessageSquare`, `X`, `Send`, `Bot`, `User`, `Loader2`.
- Needed new icons from `lucide-react`: `Mic`, `Paperclip`.

### 2.2 Styling System & Glassmorphism
The component utilizes inline CSS styles integrated with CSS variables defined in `src/app/globals.css`:
- `var(--aqua-teal)`: Primary accent color (`#4ca2b5` in dark mode, `#2f8395` in light mode).
- `var(--text-primary)`: (`#f8fafc` / `#0f172a`).
- `var(--text-secondary)`: (`#94a3b8` / `#64748b`).
- `var(--glass-bg)` & `var(--glass-border)`: Used across the app for frosted glass effect.
- Modal backdrop & container: `background: "rgba(15, 23, 42, 0.95)"`, `backdropFilter: "blur(10px)"`, `border: "1px solid rgba(255, 255, 255, 0.1)"`, `borderRadius: "16px"`, `boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"`.

---

## 3. Required Enhancements & Implementation Details

### 3.1 TypeScript Type Definitions
To support multimodal vision messages while maintaining strict TypeScript safety:

```typescript
export interface MessageContentText {
  type: "text";
  text: string;
}

export interface MessageContentImage {
  type: "image_url";
  image_url: {
    url: string; // Base64 data URI: data:image/...;base64,...
  };
}

export type MessageContentPart = MessageContentText | MessageContentImage;
export type MessageContent = string | MessageContentPart[];

export interface ChatMessage {
  role: "assistant" | "user" | "system";
  content: MessageContent;
}
```

---

### 3.2 Voice Input (Web Speech API)
- **APIs**: `window.SpeechRecognition || window.webkitSpeechRecognition`.
- **State**:
  - `isRecording`: `boolean` (tracks active dictation).
  - `recognitionRef`: `useRef<any>(null)` (stores active recognition instance).
- **Behavior**:
  1. User clicks the `Mic` button.
  2. If already recording, calls `recognitionRef.current?.stop()` and toggles `isRecording` to `false`.
  3. If not recording, initializes `SpeechRecognition` instance:
     - Sets language `recognition.lang = "az-AZ"` (or fallback / user locale).
     - Configures `recognition.continuous = true` (or `false` based on preference) and `recognition.interimResults = true`.
     - In `onresult`: retrieves transcript and appends/sets `input`.
     - In `onerror` and `onend`: sets `isRecording` to `false`.
     - Calls `recognition.start()` and sets `isRecording(true)`.
- **Visual Indicator**:
  - When `isRecording === true`: Mic icon turns red (`#ef4444`) with pulsating keyframe animation (`pulseRed`).

```typescript
const toggleRecording = () => {
  if (isRecording) {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    return;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Brauzeriniz səs tanıma funksiyasını dəstəkləmir.");
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = "az-AZ";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setInput(prev => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
    };

    recognition.onerror = (event: any) => {
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
```

---

### 3.3 Image Attachment & Preview
- **State**:
  - `selectedImage`: `string | null` (Base64 data URL).
  - `fileInputRef`: `useRef<HTMLInputElement>(null)`.
- **Behavior**:
  1. Paperclip button triggers hidden `<input type="file" ref={fileInputRef} accept="image/*" />`.
  2. `handleImageSelect` reads `e.target.files[0]`.
  3. Uses `FileReader.readAsDataURL(file)` to generate a Base64 string.
  4. Resets `e.target.value = ""` so the same file can be re-selected if deleted.
  5. Shows a thumbnail preview directly above the input bar with an 'X' button to cancel the attachment (`setSelectedImage(null)`).

```typescript
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
```

---

### 3.4 Updated `sendMessage` (OpenAI Vision Payload)
When sending a message:
1. Validation: allowed if `input.trim()` is non-empty OR `selectedImage` is present.
2. If `selectedImage` is present:
   ```typescript
   const userContent: MessageContentPart[] = [
     { type: "text", text: input.trim() || "Şəkil əlavə edildi" },
     { type: "image_url", image_url: { url: selectedImage } }
   ];
   ```
3. If `selectedImage` is null:
   ```typescript
   const userContent: string = input.trim();
   ```
4. Construct `userMessage = { role: "user", content: userContent }`.
5. Append `userMessage` to `messages`, reset `input = ""` and `selectedImage = null`.
6. Dispatch POST request with `body: JSON.stringify({ messages: [...messages, userMessage] })`.

```typescript
const sendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if ((!input.trim() && !selectedImage) || loading) return;

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
  } catch (error) {
    setMessages(prev => [...prev, { role: "assistant", content: "Şəbəkə xətası baş verdi." }]);
  } finally {
    setLoading(false);
  }
};
```

---

### 3.5 Rendering Messages with Images in Chat History
Within the message list rendering loop `messages.map((m, i) => ...)`:
- If `typeof m.content === "string"`: render `{m.content}`.
- If `Array.isArray(m.content)`:
  - For item `type === "text"`: render text paragraph.
  - For item `type === "image_url"`: render `<img src={item.image_url.url} alt="Attached" style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "8px", objectFit: "cover" }} />`.

```tsx
<div style={{
  background: m.role === "user" ? "rgba(255, 255, 255, 0.1)" : "rgba(76, 162, 181, 0.15)",
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  borderBottomRightRadius: m.role === "user" ? "2px" : "12px",
  borderBottomLeftRadius: m.role === "assistant" ? "2px" : "12px",
  color: "var(--text-primary)",
  fontSize: "0.9rem",
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
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
            />
          );
        }
        return null;
      })}
    </div>
  ) : null}
</div>
```

---

## 4. UI Layout & Input Bar Hierarchy

```
+-------------------------------------------------------------+
| Thrive AI Header                             [ _ ] [ X ]    |
+-------------------------------------------------------------+
| Messages Container (overflow-y: auto)                       |
|   [Bot Icon]   Salam! Necə kömək edə bilərəm?               |
|                                                             |
|                [User Text + Attached Image Preview] [User]  |
|                                                             |
|   [Bot Icon]   [Loading Spinner / AI Response]              |
+-------------------------------------------------------------+
| Image Preview Container (Visible only when selectedImage)   |
|   [ [Img Thumb] (x) ] "Şəkil əlavə olundu"                  |
+-------------------------------------------------------------+
| Input Form (display: flex, align-items: center)             |
|   [📎 Paperclip]  [🎤 Mic]  [  Input text...  ]  [➤ Send]  |
+-------------------------------------------------------------+
```

### Pulsating Animation Keyframes:
```css
@keyframes pulseRed {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
```

---

## 5. Summary of Recommended Implementation Steps for Implementer

1. **Imports**: Add `Mic`, `Paperclip` to the `lucide-react` import list.
2. **Types**: Add `ChatMessage`, `MessageContent`, `MessageContentText`, `MessageContentImage`.
3. **State Hooks**:
   - `const [isRecording, setIsRecording] = useState(false);`
   - `const [selectedImage, setSelectedImage] = useState<string | null>(null);`
   - `const recognitionRef = useRef<any>(null);`
   - `const fileInputRef = useRef<HTMLInputElement>(null);`
4. **Handlers**:
   - Add `toggleRecording()` with `window.SpeechRecognition` / `window.webkitSpeechRecognition`.
   - Add `handleImageSelect()` and `handleRemoveImage()`.
   - Update `sendMessage()` to support multimodal array payload and image state cleanup.
5. **JSX Template**:
   - Update message rendering to branch between string and array content.
   - Insert image preview container right above the form.
   - Insert paperclip and mic buttons into the input form before the `<input>` element.
   - Insert hidden `<input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />`.
   - Add `@keyframes pulseRed` inside the `<style>` block.
