# AI Dashboard Survey & Architecture Investigation Report

**Document**: `survey_report.md`  
**Explorer Agent**: `explorer_survey_3`  
**Date**: 2026-08-16  
**Scope**: Design system analysis, translation files evaluation, optimal UI/UX architecture, and implementation blueprint for `src/app/[locale]/dashboard/ai/page.tsx` and sidebar integration.

---

## Executive Summary

This report delivers a thorough architectural blueprint and design specification for implementing the dedicated **AI Dashboard Page** (`src/app/[locale]/dashboard/ai/page.tsx`) in Thrive CRM. The target design is a full-height, ChatGPT-like workspace utilizing the existing custom glassmorphism design system (`var(--glass-bg)`, `var(--aqua-teal)`, CSS modules, Framer Motion), featuring multimodal image upload, voice dictation via the Web Speech API, intelligent starter suggestion cards, and seamless integration with the dashboard shell and Next-Intl localization across Azerbaijani (`az`), English (`en`), and Russian (`ru`).

---

## 1. Design System, CSS Variables & Styling Conventions

### 1.1 Styling Architecture Overview
- **Styling Method**: Pure CSS Modules (`*.module.css`) paired with global CSS Custom Properties (`globals.css`) and Framer Motion for interactive micro-animations. No Tailwind CSS dependency is present in `package.json`.
- **Theming Mechanism**: Controlled by `next-themes` via `data-theme="dark"` (default) and `data-theme="light"` on the root `<html>`/`<body>` elements.

### 1.2 Color & Glassmorphism Design Tokens (`src/app/globals.css`)

| Variable | Dark Theme Value (Default) | Light Theme Value | Usage in AI Dashboard |
|---|---|---|---|
| `--deep-navy` | `#000b21` | `#f8fafc` | Page background, root base |
| `--ocean-blue` | `#003f82` | `#005bb5` | Primary gradients, user message accents |
| `--aqua-teal` | `#4ca2b5` | `#2f8395` | Brand highlight, AI avatar, active buttons, neon glow effects |
| `--white` | `#ffffff` | `#0f172a` | High-contrast headings, primary text, icon fills |
| `--gray-light` | `#f4f7f6` | `#e2e8f0` | Subtle background highlights |
| `--text-primary` | `#f8fafc` | `#0f172a` | Primary chat text, headings, input text |
| `--text-secondary` | `#94a3b8` | `#64748b` | Timestamps, subtitles, helper text, empty states |
| `--glass-bg` | `rgba(2, 6, 23, 0.7)` | `rgba(255, 255, 255, 0.8)` | Message bubbles, bottom input bar, starter cards |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | `rgba(0, 0, 0, 0.1)` | Card borders, input container borders, dividers |
| `--gradient-primary` | `linear-gradient(135deg, #000b21 0%, #003f82 50%, #4ca2b5 100%)` | `linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)` | Header banners, primary buttons |

### 1.3 Ambient Background & Glow System
The body in `globals.css` applies fixed radial glow lighting:
```css
background-image: 
  radial-gradient(circle at 15% 50%, rgba(0, 63, 130, 0.15) 0%, transparent 50%),
  radial-gradient(circle at 85% 30%, rgba(76, 162, 181, 0.1) 0%, transparent 50%);
background-attachment: fixed;
```
For the AI Dashboard, we recommend augmenting this with a central subtle cyan/ocean ambient glow behind the message stream:
```css
.aiContainer::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 350px;
  background: radial-gradient(circle, rgba(76, 162, 181, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
```

### 1.4 Interactive States & Micro-interactions
- **Active glow on focus/active elements**: `box-shadow: 0 0 15px rgba(76, 162, 181, 0.35);`
- **Pulsing voice recording indicator**:
  ```css
  @keyframes pulseRed {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  ```
- **Loading spin indicator**:
  ```css
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  ```
- **Framer Motion Presets**:
  - Message bubble enter: `initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}`
  - Starter card hover: `whileHover={{ y: -4, borderColor: 'var(--aqua-teal)', boxShadow: '0 8px 25px rgba(76, 162, 181, 0.2)' }}`

---

## 2. Translation Architecture & Localization (Next-Intl)

### 2.1 Current File Structure & Locales
- **Locales supported**: `az` (Azerbaijani - default), `en` (English), `ru` (Russian)
- **Translation directory**: `messages/az.json`, `messages/en.json`, `messages/ru.json`
- **Routing setup**: Configured via `src/i18n/routing.ts` (`defineRouting({ locales: ['en', 'az', 'ru'], defaultLocale: 'az', localePrefix: 'always' })`)
- **Server layout**: `src/app/[locale]/layout.tsx` loads messages via `getMessages()` and wraps the app with `NextIntlClientProvider`.

### 2.2 Recommended Translation Key Updates

#### A. `Sidebar` Namespace Updates
In all 3 translation files (`az.json`, `en.json`, `ru.json`), add the `ai` menu item key:
- **`messages/az.json`**: `"ai": "AI Köməkçi"`
- **`messages/en.json`**: `"ai": "AI Assistant"`
- **`messages/ru.json`**: `"ai": "AI Помощник"`

#### B. New Dedicated `AiDashboard` Namespace
Add a comprehensive `"AiDashboard"` key to all three language files:

```json
/* messages/az.json */
"AiDashboard": {
  "title": "AI Köməkçi",
  "subtitle": "Tədris mərkəzinin intellektual idarəetmə və analitika mərkəzi",
  "statusBadge": "Gemini 3.6 & GPT-4o ilə aktiv",
  "newChat": "Yeni Söhbət",
  "clearChat": "Tarixçəni Təmizlə",
  "welcomeTitle": "Sizə bu gün necə kömək edə bilərəm?",
  "welcomeSubtitle": "Tələbələr, müəllimlər, dərslər, maliyyə statistikası və yeni qeydiyyatlar haqqında soruşun və ya səsli əmr verin.",
  "inputPlaceholder": "Sualınızı yazın, şəkil əlavə edin və ya mikrofona toxunun...",
  "listening": "Dinlənilir... Danışın...",
  "stopListening": "Dayandır",
  "imageAttached": "Şəkil əlavə edildi",
  "removeImage": "Şəkli sil",
  "send": "Göndər",
  "thinking": "AI düşünür və cavab hazırlayır...",
  "copy": "Kopyala",
  "copied": "Kopyalandı!",
  "speechNotSupported": "Brauzeriniz səs tanıma funksiyasını dəstəkləmir",
  "micDenied": "Mikrofon icazəsi verilmədi",
  "error": "Bağışlayın, xəta baş verdi. Zəhmət olmasa bir az sonra təkrar cəhd edin.",
  "networkError": "Şəbəkə xətası baş verdi.",
  "disclaimer": "Thrive AI bəzən qeyri-dəqiq məlumat verə bilər. Əsas qərarlar üçün məlumatları yoxlayın.",
  "capabilities": {
    "leads": "Yeni Müştəri (Lead)",
    "leadsDesc": "Instagram və ya zəngdən gələn müraciəti dərhal qeyd et",
    "finance": "Maliyyə Hesabatı",
    "financeDesc": "Aylıq gəlir, ödənilmiş məbləğ və gecikən borclar",
    "teachers": "Müəllimlər & Qruplar",
    "teachersDesc": "Aktiv müəllimlər, ixtisaslar və dərs saatları",
    "students": "Tələbə İdarəetməsi",
    "studentsDesc": "Tələbə siyahısı, FİN və qrup təyinatları"
  },
  "prompts": {
    "prompt1": "Bu ay üçün ümumi gəlir və gözləyən borclar nə qədərdir?",
    "prompt2": "Instagram-dan gələn Leyla Məmmədova adlı yeni lead yarat, tel: +994501234567",
    "prompt3": "Mərkəzdəki bütün aktiv müəllimləri və onların ixtisaslarını göstər",
    "prompt4": "Riyaziyyat fənni üzrə 10-cu sinif üçün yeni qrup yarat"
  }
}
```

```json
/* messages/en.json */
"AiDashboard": {
  "title": "AI Assistant",
  "subtitle": "Intelligent management and analytics copilot for Thrive Education",
  "statusBadge": "Active with Gemini 3.6 & GPT-4o",
  "newChat": "New Chat",
  "clearChat": "Clear History",
  "welcomeTitle": "How can I help you today?",
  "welcomeSubtitle": "Ask about students, teachers, schedules, financial stats, or execute CRM actions using voice and images.",
  "inputPlaceholder": "Type your message, attach an image, or speak with mic...",
  "listening": "Listening... Speak now...",
  "stopListening": "Stop",
  "imageAttached": "Image attached",
  "removeImage": "Remove image",
  "send": "Send",
  "thinking": "AI is thinking and generating response...",
  "copy": "Copy",
  "copied": "Copied!",
  "speechNotSupported": "Voice recognition is not supported in your browser",
  "micDenied": "Microphone permission was denied",
  "error": "Sorry, an error occurred. Please try again in a moment.",
  "networkError": "Network error occurred.",
  "disclaimer": "Thrive AI may produce inaccurate information. Please verify critical CRM records.",
  "capabilities": {
    "leads": "New Lead Inquiries",
    "leadsDesc": "Instantly register leads from Instagram, calls, or referrals",
    "finance": "Financial Analytics",
    "financeDesc": "Check monthly revenue, collections, and pending debts",
    "teachers": "Teachers & Groups",
    "teachersDesc": "View active instructors, subjects, and assigned groups",
    "students": "Student Operations",
    "studentsDesc": "Access student database, enrollments, and profiles"
  },
  "prompts": {
    "prompt1": "What is the total revenue and outstanding debt for this month?",
    "prompt2": "Create a new lead: Leyla Mammadova from Instagram, phone: +994501234567",
    "prompt3": "List all active teachers and their subject specializations",
    "prompt4": "Create a new 10th grade Math group"
  }
}
```

```json
/* messages/ru.json */
"AiDashboard": {
  "title": "AI Помощник",
  "subtitle": "Интеллектуальный центр управления и аналитики учебного центра",
  "statusBadge": "Активен на Gemini 3.6 и GPT-4o",
  "newChat": "Новый чат",
  "clearChat": "Очистить историю",
  "welcomeTitle": "Чем я могу помочь вам сегодня?",
  "welcomeSubtitle": "Спрашивайте о студентах, преподавателях, расписании, финансах или отдавайте голосовые команды.",
  "inputPlaceholder": "Введите вопрос, прикрепите изображение или нажмите на микрофон...",
  "listening": "Слушаю... Говорите...",
  "stopListening": "Остановить",
  "imageAttached": "Изображение прикреплено",
  "removeImage": "Удалить изображение",
  "send": "Отправить",
  "thinking": "AI думает и готовит ответ...",
  "copy": "Копировать",
  "copied": "Скопировано!",
  "speechNotSupported": "Распознавание речи не поддерживается вашим браузером",
  "micDenied": "Доступ к микрофону отклонен",
  "error": "Произошла ошибка. Пожалуйста, попробуйте еще раз позже.",
  "networkError": "Произошла сетевая ошибка.",
  "disclaimer": "Thrive AI может ошибаться. Проверяйте важную информацию в CRM.",
  "capabilities": {
    "leads": "Новые Лиды (Заявки)",
    "leadsDesc": "Быстрая регистрация обращений из Instagram или звонков",
    "finance": "Финансовая Аналитика",
    "financeDesc": "Ежемесячный доход, оплаты и текущие задолженности",
    "teachers": "Преподаватели и Группы",
    "teachersDesc": "Список активных преподавателей и их предметов",
    "students": "База Студентов",
    "studentsDesc": "Просмотр студентов, ФИН-кодов и распределений по группам"
  },
  "prompts": {
    "prompt1": "Каков общий доход и ожидаемый долг за этот месяц?",
    "prompt2": "Создай нового лида: Лейла Мамедова из Instagram, тел: +994501234567",
    "prompt3": "Покажи всех активных преподавателей и их специальности",
    "prompt4": "Создай новую группу по математике для 10 класса"
  }
}
```

---

## 3. UI/UX Architecture for `src/app/[locale]/dashboard/ai/page.tsx`

### 3.1 Layout & Dashboard Shell Integration
`DashboardLayout` (`src/app/[locale]/dashboard/layout.tsx`) embeds children inside `<main className={styles.pageContent}>`:
- `.pageContent` styles: `flex: 1; padding: 2rem; overflow-y: auto; position: relative;`
- To achieve a **clean, fixed ChatGPT-style viewport**:
  - The AI page container should span `height: calc(100vh - 70px - 4rem)` on desktop (`padding: 2rem` top and bottom deducted) or `height: 100%`.
  - It must have `display: flex; flex-direction: column; overflow: hidden; position: relative;` so that outer page scrollbars are avoided and inner message scroll handles long conversations gracefully.
  - On mobile (`max-width: 1024px`), height adjusts smoothly to `height: calc(100vh - 70px - 2.5rem)`.

### 3.2 Visual & Structural Wireframe

```
+---------------------------------------------------------------------------------------------------+
|  [AI Köməkçi]  ● Gemini 3.6 Flash / GPT-4o        [+ Yeni Söhbət]  [🗑 Tarixçəni Təmizlə]       |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [EMPTY STATE / WELCOME HERO]                                                                     |
|                                                                                                   |
|         (🤖 Bot Avatar with glowing pulse ring)                                                   |
|         # Sizə bu gün necə kömək edə bilərəm?                                                     |
|         Tələbələr, müəllimlər, maliyyə və CRM əməliyyatları barədə soruşun...                    |
|                                                                                                   |
|         +-------------------------+   +-------------------------+                                 |
|         | 🎯 Yeni Lead Yarat      |   | 💳 Maliyyə Hesabatı     |                                 |
|         | Instagram və zəngləri.. |   | Gəlir və borc analizi.. |                                 |
|         +-------------------------+   +-------------------------+                                 |
|         | 👨‍🏫 Müəllimlər Siyahısı  |   | 👥 Tələbə İdarəetməsi   |                                 |
|         | Fənlər və cədvəllər..   |   | Qruplar və qeydiyyat..  |                                 |
|         +-------------------------+   +-------------------------+                                 |
|                                                                                                   |
|  [ACTIVE MESSAGE STREAM - AUTO SCROLLING VIEWPORT]                                                |
|                                                                                                   |
|  (User Bubble - Right Aligned)                                                                    |
|  [Image Thumbnail if attached]                                                                    |
|  "Bu ay üzrə gəlir və borc statistikasını göstər"                                                 |
|                                                                                                   |
|  (Assistant Bubble - Left Aligned with Bot Avatar)                                                |
|  "Cari ay üçün maliyyə göstəriciləri:                                                             |
|   • Ümumi Gəlir: 14,250 ₼                                                                         |
|   • Gözləyən Borclar: 2,100 ₼                                                                     |
|   Əlavə hansısa tələbənin ödənişini yoxlamaq istəyirsiniz?"                                       |
|  [📋 Kopyala]                                                                                     |
|                                                                                                   |
|  (Typing/Thinking indicator when loading: 🤖 AI düşünür və cavab hazırlayır...)                   |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|  [ATTACHMENT PREVIEW BAR (if image attached)]                                                    |
|  [ 🖼️ receipt_photo.jpg (x) ]                                                                    |
+---------------------------------------------------------------------------------------------------+
|  [FLOATING GLASSMORPHIC INPUT DOCK (Max-width 850px centered)]                                    |
|                                                                                                   |
|  [📎 Attach]  [🎤 Mic]  | Yazın və ya səsli əmr verin... |                        [⬆ Send]       |
+---------------------------------------------------------------------------------------------------+
|  Quick chips: [Maliyyə xülasəsi] [Yeni Lead] [Müəllimlər] [Bugünkü dərslər]                       |
|  Disclaimer: "Thrive AI bəzən qeyri-dəqiq məlumat verə bilər."                                   |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Technical Specifications & Functional Engines

### 4.1 State Management & Message Format
The state should support both single-text messages and multimodal OpenAI vision schema messages:
```typescript
interface TextContent {
  type: "text";
  text: string;
}

interface ImageContent {
  type: "image_url";
  image_url: {
    url: string; // Base64 data URL (e.g. data:image/jpeg;base64,...)
  };
}

type MessageContent = string | (TextContent | ImageContent)[];

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: MessageContent;
  timestamp?: string;
}
```

### 4.2 Voice Recognition Engine (Speech-to-Text)
- **API**: Native browser `window.SpeechRecognition` or `window.webkitSpeechRecognition`.
- **Locale Synchronization**:
  ```typescript
  const locale = useLocale();
  const getRecognitionLang = (loc: string) => {
    switch(loc) {
      case 'az': return 'az-AZ';
      case 'ru': return 'ru-RU';
      case 'en': return 'en-US';
      default: return 'az-AZ';
    }
  };
  ```
- **Lifecycle & Error Handling**:
  - `recognition.continuous = false;` (auto stops upon sentence completion)
  - `recognition.interimResults = true;` (provides real-time feedback as user speaks)
  - Handles `onerror`: notifies user gracefully if permission was denied without crashing.
  - Recording state toggles glowing red pulsating button with microphone wave animation.

### 4.3 Multimodal Image Attachment Engine
- Accepts PNG, JPG, JPEG, WEBP, GIF via hidden file input or drag-and-drop.
- Max size validation: 5MB recommended limit.
- Conversion using `FileReader`:
  ```typescript
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Şəkil həcmi 5MB-dan kiçik olmalıdır");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  ```
- Sending format:
  ```typescript
  const userContent: MessageContent = selectedImage
    ? [
        { type: "text", text: input.trim() || "Zəhmət olmasa bu şəkli təhlil et." },
        { type: "image_url", image_url: { url: selectedImage } }
      ]
    : input.trim();
  ```

### 4.4 API Integration (`/api/ai`)
- `POST /api/ai` receives `{ messages: ChatMessage[] }`.
- Backend supports Gemini 3.6 Flash and GPT-4o fallback via OpenRouter, as well as CRM database tool execution (`create_lead`, `create_student`, `create_teacher`, `create_group`, `get_financial_stats`, `get_teachers`, `get_students`).
- Page handles response:
  - Success: appends assistant response `{ role: "assistant", content: data.content }`.
  - Error: displays local error toast & fallback assistant message.

---

## 5. Implementation File Blueprint

### 5.1 File List to Create / Modify
1. **Create**: `src/app/[locale]/dashboard/ai/page.tsx`
2. **Create**: `src/app/[locale]/dashboard/ai/page.module.css`
3. **Modify**: `src/app/[locale]/dashboard/layout.tsx` (Add `Bot` import and `{ name: t("ai"), href: "/dashboard/ai", icon: Bot }` in `navItems`)
4. **Modify**: `messages/az.json` (Add `Sidebar.ai` and `AiDashboard` namespace)
5. **Modify**: `messages/en.json` (Add `Sidebar.ai` and `AiDashboard` namespace)
6. **Modify**: `messages/ru.json` (Add `Sidebar.ai` and `AiDashboard` namespace)

### 5.2 TypeScript Definition Best Practice
To prevent DOM `window.webkitSpeechRecognition` compile errors in strict mode, include a TypeScript global declaration at the top of `page.tsx`:
```typescript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
```

---

## 6. Verification Plan & Quality Assurance Checklist

| Check | Requirement | Verification Method |
|---|---|---|
| **Route Navigation** | `/dashboard/ai` loads within dashboard shell | Navigate to route, verify layout & active menu item |
| **Sidebar Menu** | "AI Köməkçi" / "AI Assistant" with `Bot` icon | Check `layout.tsx` rendering in AZ/EN/RU |
| **Glassmorphism UI** | Uses `var(--glass-bg)`, `var(--aqua-teal)`, backdrop-filter | Visual inspection in dark and light themes |
| **Voice Input** | Mic button starts dictation, pulses red, populates input | Test with Web Speech API in Chrome/Edge |
| **Image Input** | Paperclip attaches image, preview renders, sends Base64 | Upload image, verify preview & sent message payload |
| **CRM Prompts** | Quick suggestion cards populate input or trigger query | Click suggestion card, verify automatic request |
| **Build & Typecheck** | Zero TypeScript or ESLint errors | Run `npm run build` or `npx tsc --noEmit` |

---
*Report prepared by explorer_survey_3.*
