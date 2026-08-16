# Project-Wide Context & AI Features Investigation Report

## 1. Executive Summary

This investigation explores the project-wide architecture, styling system, internationalization setup, navigation layout, and AI interfaces across the Thrive CRM codebase to guide the development of the **Dedicated AI Dashboard Page (`/dashboard/ai`)**, the **Sidebar navigation update**, and the **AiChatbot enhancements (Voice + Image attachments)**.

### Key Discoveries:
1. **Sidebar Location**: There is currently **no existing `src/components/Sidebar.tsx` file**. The sidebar is hardcoded inline within `src/app/[locale]/dashboard/layout.tsx` (lines 72–119). A separate `Sidebar.tsx` component should either be created and imported into `layout.tsx`, or `layout.tsx` should be updated with the new menu item and `Sidebar.tsx` provided for modularity.
2. **Dedicated AI Page (`/dashboard/ai`)**: Does not exist yet. It should be created at `src/app/[locale]/dashboard/ai/page.tsx` (with an accompanying `page.module.css`) to provide a full-height, glassmorphic ChatGPT/Claude-like interface inside the dashboard.
3. **i18n Setup**: The application uses `next-intl` (v3.26.3) with locales `['az', 'en', 'ru']` (default: `'az'`). The `"Sidebar"` namespace in `messages/{az,en,ru}.json` needs the new `"ai"` key (`"AI Köməkçi"`, `"AI Assistant"`, `"AI Помощник"`). An `"AiPage"` namespace should also be added for dedicated page UI strings.
4. **Design Tokens & Theme System**: Defined in `src/app/globals.css`. Uses CSS custom properties: `--deep-navy` (`#000b21`), `--ocean-blue` (`#003f82`), `--aqua-teal` (`#4ca2b5`), `--text-primary` (`#f8fafc`), `--text-secondary` (`#94a3b8`), `--glass-bg` (`rgba(2, 6, 23, 0.7)`), and `--glass-border` (`rgba(255, 255, 255, 0.1)`). Supports `[data-theme='dark']` and `[data-theme='light']` via `next-themes`.
5. **Architectural Assessment (`AiChatbot.tsx` vs `/dashboard/ai`)**: `AiChatbot.tsx` is globally mounted in `src/app/[locale]/layout.tsx` as a fixed floating widget (`350x500px`). The `/dashboard/ai` page is a full-page centered dashboard experience. They should share the same `/api/ai` endpoint and Vision/Voice message format, but remain distinct UI components. Furthermore, `AiChatbot.tsx` should conditionally hide its floating bubble when the user is on the `/dashboard/ai` page.

---

## 2. Navigation & Sidebar Architecture

### Current State:
- File: `src/app/[locale]/dashboard/layout.tsx`
- The sidebar navigation items are defined on lines 44–54:
  ```typescript
  const navItems = [
    { name: t("dashboard"), href: `/dashboard`, icon: LayoutDashboard },
    { name: t("leads"), href: `/dashboard/leads`, icon: Target },
    { name: t("students"), href: "/dashboard/students", icon: Users },
    { name: t("groups"), href: "/dashboard/groups", icon: Component },
    { name: t("parents"), href: "/dashboard/parents", icon: UserPlus },
    { name: t("teachers"), href: "/dashboard/teachers", icon: BookOpen },
    { name: t("schedule"), href: `/dashboard/schedule`, icon: Calendar },
    { name: t("finance"), href: `/dashboard/finance`, icon: CreditCard },
    { name: t("tasks"), href: `/dashboard/tasks`, icon: KanbanSquare },
  ];
  ```
- File `src/components/Sidebar.tsx` **does not exist**.

### Required Action:
1. Add `Bot` from `lucide-react` to the imports.
2. Add `{ name: t("ai"), href: `/dashboard/ai`, icon: Bot }` to `navItems` (either placed directly below `tasks` or appropriately in the navigation list).
3. To fulfill the prompt's reference to `src/components/Sidebar.tsx`, we can create `src/components/Sidebar.tsx` as a reusable component or keep `layout.tsx` updated while also exporting `Sidebar.tsx` to maintain compatibility with any external references.

---

## 3. Dedicated AI Dashboard Page (`src/app/[locale]/dashboard/ai/page.tsx`)

### Location:
`src/app/[locale]/dashboard/ai/page.tsx` + `src/app/[locale]/dashboard/ai/page.module.css`

### Specifications:
1. **Layout & Dimensions**:
   - Takes full available height of `<main className={styles.pageContent}>` (`height: calc(100vh - 70px - 4rem)` or `flex: 1`, `display: flex`, `flex-direction: column`).
   - Clean, centered container (max-width `900px` to `1000px`) reminiscent of ChatGPT/Claude web interfaces.
2. **Glassmorphic Styling**:
   - Chat container: `background: var(--glass-bg)`, `border: 1px solid var(--glass-border)`, `backdrop-filter: blur(16px)`, `border-radius: 16px`.
   - Message bubbles:
     - User message: `background: rgba(76, 162, 181, 0.2)`, `border: 1px solid rgba(76, 162, 181, 0.3)`, `color: var(--text-primary)`.
     - Assistant message: `background: rgba(255, 255, 255, 0.05)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `color: var(--text-primary)`.
   - Action buttons / quick suggestion chips:
     - Examples: *"Yeni Lead əlavə et"*, *"Maliyyə hesabatı"*, *"Tələbə axtarışı"*, *"Cədvələ baxış"*.
3. **Capabilities**:
   - **Voice Input**: Speech-to-text dictation with `window.SpeechRecognition` / `window.webkitSpeechRecognition`, recording toggle, animated pulsating red mic button.
   - **Image Attachment**: Paperclip button, file picker accepting images, `FileReader` converting to base64 preview, thumbnail with 'X' remove button, OpenAI Vision content schema `{ type: "text", text }, { type: "image_url", image_url: { url: base64 } }`.
   - **API Integration**: POST to `/api/ai` with `{ messages }`.
   - **Clear Chat**: Ability to reset the conversation.

---

## 4. Internationalization & Translations (`messages/` + `next-intl`)

### Configuration:
- Routing: `src/i18n/routing.ts` (`locales: ['en', 'az', 'ru']`, `defaultLocale: 'az'`, `localePrefix: 'always'`).
- Request Loader: `src/i18n/request.ts` imports `messages/${locale}.json`.

### Required Translation Updates:

#### 1. `Sidebar` Namespace:
| Locale | Key | Value |
|---|---|---|
| `messages/az.json` | `"ai"` | `"AI Köməkçi"` |
| `messages/en.json` | `"ai"` | `"AI Assistant"` |
| `messages/ru.json` | `"ai"` | `"AI Помощник"` |

#### 2. `AiPage` Namespace:
```json
// messages/az.json
"AiPage": {
  "title": "Thrive AI Köməkçi",
  "subtitle": "CRM məlumatlarınızı idarə edin, təhlillər aparın və əmrlər verin.",
  "placeholder": "Nəsə soruşun və ya tapşırıq verin...",
  "listening": "Dinlənilir...",
  "send": "Göndər",
  "clearChat": "Söhbəti təmizlə",
  "suggestionsTitle": "Təklif olunan suallar və əmrlər:",
  "suggestion1": "Bu ayın ümumi maliyyə statistikasını göstər",
  "suggestion2": "Yeni müraciət (Lead) necə əlavə olunur?",
  "suggestion3": "Gözləyən ödənişlər haqqında məlumat ver",
  "suggestion4": "Aktiv tələbələrin və qrupların sayı nə qədərdir?"
}
```

```json
// messages/en.json
"AiPage": {
  "title": "Thrive AI Assistant",
  "subtitle": "Manage your CRM data, run analytics, and execute commands.",
  "placeholder": "Ask anything or give a command...",
  "listening": "Listening...",
  "send": "Send",
  "clearChat": "Clear chat",
  "suggestionsTitle": "Suggested questions and commands:",
  "suggestion1": "Show overall financial stats for this month",
  "suggestion2": "How to create a new Lead?",
  "suggestion3": "Give information on pending payments",
  "suggestion4": "How many active students and groups are there?"
}
```

```json
// messages/ru.json
"AiPage": {
  "title": "Thrive AI Помощник",
  "subtitle": "Управляйте данными CRM, проводите аналитику и отдавайте команды.",
  "placeholder": "Спросите что-нибудь или дайте команду...",
  "listening": "Слушаю...",
  "send": "Отправить",
  "clearChat": "Очистить чат",
  "suggestionsTitle": "Рекомендуемые вопросы и команды:",
  "suggestion1": "Показать общую финансовую статистику за этот месяц",
  "suggestion2": "Как добавить новый Лид?",
  "suggestion3": "Предоставить информацию о просроченных платежах",
  "suggestion4": "Сколько сейчас активных студентов и групп?"
}
```

---

## 5. UI Design Tokens & Styling System

The project uses CSS modules and CSS Custom Properties declared in `src/app/globals.css`.

### Core Color & Glassmorphism Tokens:
```css
:root, [data-theme='dark'] {
  --deep-navy: #000b21;
  --ocean-blue: #003f82;
  --aqua-teal: #4ca2b5;
  --white: #ffffff;
  --gray-light: #f4f7f6;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --glass-bg: rgba(2, 6, 23, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --gradient-primary: linear-gradient(135deg, var(--deep-navy) 0%, var(--ocean-blue) 50%, var(--aqua-teal) 100%);
  --bg-main: var(--deep-navy);
}
```

### Motion & Animation:
- Framer Motion `motion.div`, `AnimatePresence` are used throughout `DashboardLayout`, `DashboardPage`, `AiChatbot`, etc.
- Pulsating recording mic animation:
  ```css
  @keyframes pulseRed {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  ```

---

## 6. Architectural Comparison: `AiChatbot.tsx` vs `/dashboard/ai/page.tsx`

| Attribute | `src/components/AiChatbot.tsx` | `src/app/[locale]/dashboard/ai/page.tsx` |
|---|---|---|
| **Mount Location** | Global in `src/app/[locale]/layout.tsx` | Route-specific under `dashboard/layout.tsx` |
| **Visual Appearance** | Floating trigger button (`60x60px`) + popup dialog (`350x500px`) in bottom right | Full-page responsive container with message stream and centered action panel |
| **State Persistence** | Transient widget state (open/closed) | Full route view with scrollable message container and prompt suggestion chips |
| **Backend Target** | `POST /api/ai` | `POST /api/ai` |
| **Payload Schema** | OpenAI Chat Completion message format (supports text & Vision image_url array) | Identical OpenAI Chat Completion message format |
| **Visibility Control** | Should hide when `pathname.includes('/dashboard/ai')` to prevent duplicate chat UI | Always rendered when visiting `/dashboard/ai` |

### Code Sharing Recommendation:
- Keep the components modular and self-contained to avoid brittle layout coupling.
- Ensure both components use identical TypeScript interfaces for messages:
  ```typescript
  export type ChatMessageContent = 
    | string 
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;

  export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: ChatMessageContent;
  }
  ```

---

## 7. SpeechRecognition & Vision Handling Technical Specs

### SpeechRecognition:
```typescript
const SpeechRecognition = 
  typeof window !== "undefined" && 
  ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
```
- Toggle active recording with `recognition.start()` and `recognition.stop()`.
- Set `recognition.continuous = false;` and `recognition.interimResults = true;`.
- Populate `input` state in `onresult`.
- Update `isRecording` state on `onstart` and `onend`.

### Image FileReader & Vision Payload:
```typescript
const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast.error("Zəhmət olmasa şəkil faylı seçin");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    setImageAttachment(reader.result as string);
  };
  reader.readAsDataURL(file);
};
```
- Message formation:
  ```typescript
  const userContent: ChatMessageContent = imageAttachment
    ? [
        { type: "text", text: input },
        { type: "image_url", image_url: { url: imageAttachment } }
      ]
    : input;
  ```

---

## 8. Verification & Next Steps

1. **Sidebar Integration**:
   - Check `src/app/[locale]/dashboard/layout.tsx` and ensure `Bot` icon and `/dashboard/ai` route are present.
   - Create `src/components/Sidebar.tsx` if standalone component is desired.
2. **Dedicated Page**:
   - Create `src/app/[locale]/dashboard/ai/page.tsx` and `page.module.css`.
3. **Floating Widget Optimization**:
   - Update `src/components/AiChatbot.tsx` with Voice, Image upload, and suppress display on `/dashboard/ai`.
4. **Translations**:
   - Update `messages/az.json`, `messages/en.json`, `messages/ru.json` with `"ai"` and `"AiPage"` keys.
5. **Build & Typecheck**:
   - Run `npx tsc --noEmit` to verify type safety.
