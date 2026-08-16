# Technical Investigation Report: TypeScript, Speech API, AI Backend & Message Schemas

**Explorer:** Explorer 2  
**Date:** 2026-08-16  
**Scope:** TypeScript compilation, SpeechRecognition declarations & SSR safety, `/api/ai` backend architecture & fallback handling, and message interface schemas (Vision + Dictation).

---

## Executive Summary

This report documents the architectural and technical findings needed for implementing:
1. **Voice Input (Dictation)** via Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with type-safe ambient declarations and SSR-safe execution.
2. **Vision / Image Upload Support** with base64 encoding and OpenAI Vision payload formats (`content: string | ContentPart[]`).
3. **Dedicated AI Dashboard Page (`/dashboard/ai`)** with ChatGPT-style glassmorphism interface and Sidebar navigation.
4. **Resilient AI Backend (`/api/ai`)** featuring automated fallback to OpenRouter GPT-4o on Gemini failures, and comprehensive CRM tools (`create_teacher`, `create_student`, `create_group`, `get_teachers`, `get_students`, `create_lead`, `get_financial_stats`).

---

## 1. TypeScript Configuration & Build / Typecheck Analysis

### 1.1 `tsconfig.json` & Compilation Settings
- **Target:** `ES2017`
- **Module Resolution:** `bundler`
- **Strict Mode:** `true` (requires explicit types for function parameters, no implicit `any`, safe null checks)
- **Includes:** `"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"]`
- Any global type declaration created under `src/types/*.d.ts` (e.g. `src/types/speech.d.ts`) is automatically loaded by the compiler without requiring `tsconfig.json` modifications.

### 1.2 Typecheck & Build Commands
- **Typecheck Command:** `npx tsc --noEmit`
- **Build Command:** `npm run build` (runs `rm -rf .next && next build`)
- **Lint Command:** `npm run lint` (runs `eslint` with Next.js flat compat config)
- **Observation on Type Checking:** `npx tsc --noEmit` operates in strict mode. All new code, interfaces, event handlers, and tool executors must have explicit type annotations to satisfy strict checking.

---

## 2. SpeechRecognition & webkitSpeechRecognition API Declarations

### 2.1 Problem Analysis
- The Web Speech API is not part of standard TypeScript DOM types by default.
- Accessing `window.SpeechRecognition` or `window.webkitSpeechRecognition` directly results in:
  `Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.`
- In Next.js client components (`"use client"`), modules are pre-rendered on the server during SSR. Calling `window` at top-level causes hydration mismatch or `ReferenceError: window is not defined`.

### 2.2 Recommended Ambient Declaration (`src/types/speech.d.ts`)
To declare the types cleanly without external dependencies:

```typescript
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface Window {
  SpeechRecognition: {
    new (): SpeechRecognitionInstance;
  };
  webkitSpeechRecognition: {
    new (): SpeechRecognitionInstance;
  };
}
```

### 2.3 SSR-Safe Hook / Component Pattern
```typescript
// 1. Guard against SSR window access
const getSpeechRecognitionClass = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

// 2. Lifecycle management in component
const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
const [isListening, setIsListening] = useState(false);

const toggleListening = () => {
  const SpeechClass = getSpeechRecognitionClass();
  if (!SpeechClass) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  if (isListening) {
    recognitionRef.current?.stop();
    setIsListening(false);
    return;
  }

  const recognition = new SpeechClass();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "az-AZ"; // or active locale

  recognition.onstart = () => setIsListening(true);
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    if (transcript.trim()) {
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
    }
  };
  recognition.onerror = () => setIsListening(false);
  recognition.onend = () => setIsListening(false);

  recognitionRef.current = recognition;
  recognition.start();
};
```

---

## 3. Message Interface Definitions (Text & Vision / Multimodal)

### 3.1 Interface Specification
To support both plain text messages and OpenAI Vision payload formats:

```typescript
export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface TextContentPart {
  type: "text";
  text: string;
}

export interface ImageContentPart {
  type: "image_url";
  image_url: {
    url: string; // Base64 data URL e.g. "data:image/jpeg;base64,..."
  };
}

export type MessageContent = string | Array<TextContentPart | ImageContentPart>;

export interface ChatMessage {
  role: MessageRole;
  content: MessageContent;
}
```

### 3.2 UI Rendering Strategy
When rendering messages in the chat stream:
- If `typeof message.content === "string"`: Render directly as typography.
- If `Array.isArray(message.content)`:
  - Extract text: `content.find(c => c.type === "text")?.text`
  - Extract image: `content.find(c => c.type === "image_url")?.image_url.url`
  - Render preview image thumbnail + caption bubble.

---

## 4. Backend `/api/ai/route.ts` Architecture & Fallback Mechanism

### 4.1 Flow Architecture
```
Incoming POST /api/ai
    │
    ▼
Validate & prepend systemMessage
    │
    ▼
Try Primary LLM (Gemini via OpenAI SDK)
    │
    ├─► If Gemini Fails ──► Catch & initialize fallbackClient (OpenRouter GPT-4o)
    │                       Execute chat completion using fallbackClient
    ▼
Check for tool_calls in choices[0].message
    │
    ├─► If tool_calls present:
    │     ├── Execute tool function via @/lib/db (sql helper)
    │     ├── Append assistant tool_calls + tool result messages to finalMessages
    │     └── Call LLM again using the SAME client (Primary or Fallback)
    │
    ▼
Return JSON response { content: aiMessage.content || "" }
```

### 4.2 Fallback Implementation Pattern
```typescript
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import sql from "@/lib/db";

const geminiClient = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || "missing-key-during-build"
});

const fallbackClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "missing-key"
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemMessage = {
      role: "system",
      content: "Sən Thrive CRM-in ağıllı və rəsmi köməkçisisən..."
    };

    const finalMessages = [systemMessage, ...messages];

    let usedFallback = false;
    let response;

    try {
      response = await geminiClient.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: finalMessages as any,
        tools: tools as any,
        max_tokens: 1024,
      });
    } catch (geminiErr) {
      console.warn("Gemini API call failed, falling back to OpenRouter GPT-4o:", geminiErr);
      usedFallback = true;
      response = await fallbackClient.chat.completions.create({
        model: "openai/gpt-4o",
        messages: finalMessages as any,
        tools: tools as any,
        max_tokens: 1024,
      });
    }

    let aiMessage = response.choices[0].message;

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      finalMessages.push(aiMessage as any);

      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.type === "function") {
          const fnName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || "{}");
          let result: any = { error: "Unknown function" };

          if (fnName === "create_teacher") result = await createTeacher(args);
          else if (fnName === "create_student") result = await createStudent(args);
          else if (fnName === "create_group") result = await createGroup(args);
          else if (fnName === "get_teachers") result = await getTeachers();
          else if (fnName === "get_students") result = await getStudents();
          else if (fnName === "create_lead") result = await createLead(args);
          else if (fnName === "get_financial_stats") result = await getFinancialStats();

          finalMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: fnName,
            content: JSON.stringify(result)
          } as any);
        }
      }

      const activeClient = usedFallback ? fallbackClient : geminiClient;
      const activeModel = usedFallback ? "openai/gpt-4o" : "gemini-2.0-flash";

      const secondResponse = await activeClient.chat.completions.create({
        model: activeModel,
        messages: finalMessages as any,
        max_tokens: 1024,
      });

      aiMessage = secondResponse.choices[0].message;
    }

    return NextResponse.json({ content: aiMessage.content || "" });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to communicate with AI" }, { status: 500 });
  }
}
```

### 4.3 Tool Implementations with `@/lib/db` SQL Helper
- **`create_teacher`**: Creates record in `auth.users`, `user_profiles`, `teachers` (with specialization), and `user_roles`.
- **`create_student`**: Creates record in `auth.users`, `user_profiles`, `students`, and `user_roles`.
- **`create_group`**: Inserts into `groups` table (name, program_id, teacher_id, room).
- **`get_teachers`**: Queries `teachers` joined with `user_profiles`.
- **`get_students`**: Queries `students` joined with `user_profiles` ordered by `created_at DESC`.
- **`create_lead` & `get_financial_stats`**: Retained and verified from existing functionality.

---

## 5. UI & Layout Integration

1. **Dedicated AI Page:** `src/app/[locale]/dashboard/ai/page.tsx`
   - Glassmorphic card design matching `var(--glass-bg)`, `var(--glass-border)`, `var(--aqua-teal)`.
   - Prompt suggestions for common CRM actions.
   - Dynamic auto-scrolling chat history.
   - Dual input modes: Text, Dictation (mic with pulsating red animation), Image upload (FileReader base64 preview & remove tag).

2. **Sidebar Navigation:** `src/app/[locale]/dashboard/layout.tsx`
   - Added nav item: `{ name: t("aiAssistant"), href: "/dashboard/ai", icon: Bot }`
   - Added translation key `aiAssistant` in `messages/az.json` ("AI Köməkçi"), `messages/en.json` ("AI Assistant"), and `messages/ru.json` ("AI Помощник").
