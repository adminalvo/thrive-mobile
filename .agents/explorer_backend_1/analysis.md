# Backend AI Architecture & Fallback Analysis

**Target File**: `src/app/api/ai/route.ts`  
**Date**: 2026-08-16  
**Status**: Ready for Implementation  

---

## 1. Executive Summary

This report provides a comprehensive architectural assessment of the AI backend in Thrive CRM (`src/app/api/ai/route.ts`). It establishes the technical blueprint for:
1. **Primary & Fallback Multi-Provider Architecture**: Gemini (`gemini-3.6-flash`) as the primary fast provider, with seamless automatic fallback to OpenRouter (`openai/gpt-4o`) upon any primary network, quota, or execution failure.
2. **Session-Consistent Client Propagation**: Guaranteeing that any second-turn completion (post tool-execution) utilizes the exact same client and model instance that succeeded in the initial turn.
3. **Comprehensive CRM Tool System**: Expanding tool coverage to full CRM operations (`create_lead`, `get_financial_stats`, `create_teacher`, `create_student`, `create_group`, `get_teachers`, `get_students`) connected directly to Postgres via `@/lib/db`.
4. **Multimodal / Vision Compatibility**: Ensuring the route transparently handles both standard string messages and OpenAI-compliant vision content arrays (`image_url` payloads).

---

## 2. Current Implementation Inspection (`src/app/api/ai/route.ts`)

| Dimension | Current Implementation | Analysis & Limitations |
| :--- | :--- | :--- |
| **Client Initialization** | `const client = new OpenAI({ baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", apiKey: process.env.GEMINI_API_KEY || "missing-key-during-build" });` | Module-level singleton pointing to Google Gemini OpenAI-compatible gateway. If Gemini fails (rate limits, outages), the entire request fails immediately. |
| **Model Used** | `gemini-3.6-flash` | Fast and cost-effective, but single point of failure without backup. |
| **Completion Invocations** | Non-streaming `client.chat.completions.create({...})` with `max_tokens: 1024`. | Synchronous non-streaming execution; straightforward integration with frontend message polling / state updates. |
| **Tool Calling Mechanism** | Array of 2 tools (`create_lead`, `get_financial_stats`). Checked via `aiMessage.tool_calls`. | Tool arguments parsed via `JSON.parse`. Tool results appended to `finalMessages` with `role: "tool"` and `tool_call_id`. Second completion call is hardcoded to `client` and `gemini-3.6-flash`. |
| **Error Handling** | Top-level try/catch returning `{ error: error.message }` with HTTP 500. | Any transient error from Gemini results in immediate user failure without retry or fallback. |

---

## 3. Fallback Architecture & Execution Protocol

### 3.1 Design Principles
1. **Zero Downtime / High Resilience**: If Gemini fails (e.g. 429 Rate Limit, 500 Server Error, invalid API key, timeout), the request seamlessly switches to OpenRouter without throwing an error to the client.
2. **Model & Client Continuity**: When tool calls are generated and executed, the follow-up AI call that converts tool output to natural language must use the *same client and model* that produced the tool call.
3. **Defensive JSON Parsing & Execution**: Tool argument parsing is wrapped in try/catch blocks; tool errors are returned as JSON payloads to the AI model rather than throwing HTTP 500s.

### 3.2 State Management Pattern
```typescript
let activeClient: OpenAI = client;
let activeModel: string = "gemini-3.6-flash";
let response: OpenAI.Chat.Completions.ChatCompletion;

try {
  // Primary Attempt: Gemini
  response = await client.chat.completions.create({
    model: "gemini-3.6-flash",
    messages: finalMessages as any,
    tools: tools as any,
    max_tokens: 1024,
  });
  activeClient = client;
  activeModel = "gemini-3.6-flash";
} catch (geminiError: any) {
  console.warn("Primary AI call (Gemini) failed. Switching to OpenRouter fallback:", geminiError?.message || geminiError);
  
  // Fallback Client Initialization
  const fallbackClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "missing-key",
  });

  response = await fallbackClient.chat.completions.create({
    model: "openai/gpt-4o",
    messages: finalMessages as any,
    tools: tools as any,
    max_tokens: 1024,
  });
  activeClient = fallbackClient;
  activeModel = "openai/gpt-4o";
}
```

### 3.3 Post-Tool Completion Consistency
```typescript
if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
  finalMessages.push(aiMessage as any);

  for (const toolCall of aiMessage.tool_calls) {
    if (toolCall.type === "function") {
      const fnName = toolCall.function.name;
      let args: any = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch (e: any) {
        args = {};
      }
      
      const result = await executeTool(fnName, args);

      finalMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: fnName,
        content: JSON.stringify(result)
      } as any);
    }
  }

  // Follow-up AI completion uses activeClient and activeModel
  const secondResponse = await activeClient.chat.completions.create({
    model: activeModel,
    messages: finalMessages as any,
    max_tokens: 1024,
  });

  aiMessage = secondResponse.choices[0].message;
}
```

---

## 4. CRM Tools Specification & Database Implementation

### 4.1 Tool Schema Definitions

```typescript
const tools = [
  {
    type: "function",
    function: {
      name: "create_lead",
      description: "Yeni Lead (potensial müştəri) yarat",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Tam ad" },
          phone: { type: "string", description: "Telefon nömrəsi" },
          email: { type: "string", description: "Email ünvanı" },
          source: { type: "string", description: "Mənbə (məsələn, 'Instagram', 'Tövsiyə')" }
        },
        required: ["name", "phone"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_financial_stats",
      description: "Ümumi maliyyə (gəlir, borc) statistikasını gətir",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_teacher",
      description: "Yeni müəllim qeydiyyatdan keçir və sistemə əlavə et",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Müəllimin tam adı (məsələn: 'Aysel Məmmədova')" },
          phone: { type: "string", description: "Telefon nömrəsi" },
          email: { type: "string", description: "Email ünvanı" },
          subject: { type: "string", description: "İxtisas / fənn (məsələn: 'Riyaziyyat', 'İngilis dili')" },
          base_salary: { type: "number", description: "Aylıq baza maaşı" }
        },
        required: ["name", "email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_student",
      description: "Yeni tələbə qeydiyyatdan keçir və bazaya əlavə et",
      parameters: {
        type: "object",
        properties: {
          first_name: { type: "string", description: "Tələbənin adı" },
          last_name: { type: "string", description: "Tələbənin soyadı" },
          phone: { type: "string", description: "Telefon nömrəsi" },
          fin: { type: "string", description: "FİN kod" },
          grade: { type: "string", description: "Sinif və ya təhsil dərəcəsi" },
          parent_phone: { type: "string", description: "Valideynin telefon nömrəsi" }
        },
        required: ["first_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_group",
      description: "Yeni tədris qrupu yarat",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Qrupun adı (məsələn: 'IELTS-101', 'Frontend A1')" },
          teacher_id: { type: "string", description: "Təyin olunmuş müəllimin ID-si (istəyə görə)" },
          schedule: { type: "string", description: "Dərs günləri və saatı (məsələn: 'B.e / Çər / Cüm 10:00')" },
          subject: { type: "string", description: "Fənn və ya proqram adı" },
          price: { type: "number", description: "Aylıq ödəniş məbləği" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_teachers",
      description: "Sistemdəki bütün müəllimlərin siyahısını gətir",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maksimum nəticə sayı (defolt: 50)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_students",
      description: "Sistemdəki bütün tələbələrin siyahısını gətir",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maksimum nəticə sayı (defolt: 50)" }
        }
      }
    }
  }
];
```

### 4.2 Database Executors Implementation Details

```typescript
// 1. create_lead
async function createLead(args: any) {
  try {
    const validStatus = "NEW";
    const inserted = await sql`
      INSERT INTO leads (name, phone, email, source, status)
      VALUES (${args.name}, ${args.phone}, ${args.email || null}, ${args.source || 'AI Assistant'}, ${validStatus})
      RETURNING *
    `;
    return { success: true, lead: inserted[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. get_financial_stats
async function getFinancialStats() {
  try {
    const invoices = await sql`SELECT amount, status FROM invoices`;
    const payments = await sql`SELECT SUM(amount) as total_paid FROM payments`;
    const totalPaid = Number(payments[0]?.total_paid) || 0;
    let totalExpected = 0;
    invoices.forEach((inv: any) => {
      totalExpected += Number(inv.amount) || 0;
    });
    const totalDebt = Math.max(0, totalExpected - totalPaid);
    return { success: true, monthlyIncome: totalPaid, totalDebt: totalDebt };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. create_teacher
async function createTeacher(args: any) {
  try {
    const nameParts = (args.name || "").trim().split(" ");
    const firstName = nameParts[0] || "Müəllim";
    const lastName = nameParts.slice(1).join(" ") || "";
    const emailToUse = (args.email || `teacher_${Date.now()}@thrive.local`).trim().toLowerCase();
    
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const teacherId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO auth.users (id, email, role, aud, encrypted_password)
        VALUES (${userId}, ${emailToUse}, 'teacher', 'authenticated', ${hashedPassword})
        ON CONFLICT (email) DO NOTHING
      `;

      await tx`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
        VALUES (${profileId}, ${userId}, ${firstName}, ${lastName}, ${emailToUse}, ${args.phone || null})
        ON CONFLICT (id) DO NOTHING
      `;

      await tx`
        INSERT INTO teachers (id, profile_id, specialization)
        VALUES (${teacherId}, ${profileId}, ${args.subject || null})
      `;

      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${userId}, 'teacher')
        ON CONFLICT (user_id) DO UPDATE SET role = 'teacher'
      `;
    });

    return {
      success: true,
      teacher: {
        id: teacherId,
        name: `${firstName} ${lastName}`.trim(),
        email: emailToUse,
        phone: args.phone || null,
        specialization: args.subject || null,
        base_salary: args.base_salary || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. create_student
async function createStudent(args: any) {
  try {
    const firstName = args.first_name || "Tələbə";
    const lastName = args.last_name || "";
    const emailToUse = `student_${Date.now()}@thrive.local`;

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const studentId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO auth.users (id, email, role, aud, encrypted_password)
        VALUES (${userId}, ${emailToUse}, 'authenticated', 'authenticated', ${hashedPassword})
        ON CONFLICT (email) DO NOTHING
      `;

      await tx`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
        VALUES (${profileId}, ${userId}, ${firstName}, ${lastName}, ${emailToUse}, ${args.phone || null})
      `;

      await tx`
        INSERT INTO students (id, profile_id)
        VALUES (${studentId}, ${profileId})
      `;

      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${userId}, 'student')
        ON CONFLICT (user_id) DO NOTHING
      `;

      if (args.parent_phone || args.fin) {
        const parentId = crypto.randomUUID();
        const parentProfileId = crypto.randomUUID();
        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, phone)
          VALUES (${parentProfileId}, null, 'Valideyn', ${lastName}, ${args.parent_phone || null})
        `;
        await tx`
          INSERT INTO parents (id, profile_id, fin_code)
          VALUES (${parentId}, ${parentProfileId}, ${args.fin || 'TBD'})
        `;
      }
    });

    return {
      success: true,
      student: {
        id: studentId,
        name: `${firstName} ${lastName}`.trim(),
        phone: args.phone || null,
        grade: args.grade || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 5. create_group
async function createGroup(args: any) {
  try {
    let programId: string | null = null;
    if (args.subject) {
      const existingProg = await sql`
        SELECT id FROM programs WHERE LOWER(name) = LOWER(${args.subject}) AND deleted_at IS NULL LIMIT 1
      `;
      if (existingProg.length > 0) {
        programId = existingProg[0].id;
      } else {
        const newProg = await sql`
          INSERT INTO programs (name) VALUES (${args.subject}) RETURNING id
        `;
        programId = newProg[0].id;
      }
    }

    const inserted = await sql`
      INSERT INTO groups (name, program_id, teacher_id, room)
      VALUES (${args.name}, ${programId}, ${args.teacher_id || null}, ${args.schedule || 'Otaq 1'})
      RETURNING *
    `;

    return {
      success: true,
      group: inserted[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. get_teachers
async function getTeachers(args: any) {
  try {
    const limit = Number(args?.limit) || 50;
    const teachers = await sql`
      SELECT 
        t.id, 
        t.specialization, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone,
        (
          SELECT COUNT(*)::int 
          FROM groups g 
          WHERE g.teacher_id = p.user_id 
             OR g.teacher_id = t.id 
             OR g.teacher_id = t.profile_id
        ) as active_groups
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      LIMIT ${limit}
    `;

    const formatted = teachers.map((t: any) => ({
      id: t.id,
      name: `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir",
      email: t.email || "",
      phone: t.phone || "",
      specialty: t.specialization || "Təyin edilməyib",
      activeGroups: Number(t.active_groups) || 0
    }));

    return { success: true, count: formatted.length, teachers: formatted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 7. get_students
async function getStudents(args: any) {
  try {
    const limit = Number(args?.limit) || 50;
    const students = await sql`
      SELECT s.id, s.created_at, p.first_name, p.last_name, p.email, p.phone
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      ORDER BY s.created_at DESC
      LIMIT ${limit}
    `;

    const formatted = students.map((s: any) => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
      email: s.email || "",
      phone: s.phone || "",
      joinDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : ""
    }));

    return { success: true, count: formatted.length, students: formatted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

## 5. Vision / Multimodal Handling

In `AiChatbot.tsx` and the upcoming `/dashboard/ai` page, users can submit image attachments.
- Message format:
  ```json
  {
    "role": "user",
    "content": [
      { "type": "text", "text": "Bu qəbzin şəklidir, məlumatları çıxar." },
      { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
    ]
  }
  ```
- Compatibility:
  - Gemini 3.6 Flash supports OpenAI-compatible `image_url` data URIs out-of-the-box.
  - OpenRouter GPT-4o (`openai/gpt-4o`) natively processes `image_url` parts without modification.
- Implementation note: Ensure the system message is prepended as an object without modifying or type-casting user `content` parts away.

---

## 6. Recommendations & Implementation Plan

1. **Keep `export const dynamic = "force-dynamic"` & `export const maxDuration = 60`** to support long-running LLM and database operations.
2. **Add `bcrypt` import** for generating secure default hashes for newly created users in raw SQL transactions.
3. **Structure tool dispatch table** with a clean switch or lookup map for maintainability.
4. **Preserve exact response contract**: `{ content: string }` on HTTP 200, `{ error: string }` on HTTP 400/500.
