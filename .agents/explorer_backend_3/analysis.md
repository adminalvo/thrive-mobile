# AI Backend Enhancements Analysis & Tool Schema Designs

**Author:** Explorer Backend 3  
**Target File:** `src/app/api/ai/route.ts`  
**Date:** 2026-08-16  

---

## 1. Executive Summary

This document provides the complete investigation, tool schema definitions, database execution logic, error handling pipeline, and dual-client fallback mechanism (Gemini `gemini-3.6-flash` with OpenRouter `openai/gpt-4o` fallback) for `src/app/api/ai/route.ts`.

The enhancements allow the AI assistant to perform full CRUD/query operations on Thrive CRM, including:
1. **Teacher Management:** `create_teacher`, `get_teachers`
2. **Student Management:** `create_student`, `get_students`
3. **Group Management:** `create_group`
4. **Lead & Financial Operations:** `create_lead`, `get_financial_stats`

---

## 2. Existing Architecture & Tool Calling Format

### 2.1 Route Configuration
- **Dynamic Mode:** `export const dynamic = "force-dynamic"`
- **Max Duration:** `export const maxDuration = 60`
- **Database Access:** PostgreSQL via `sql` helper imported from `@/lib/db` (`postgres` library with connection pooling)
- **Primary AI Client:** OpenAI SDK configured with Gemini baseURL (`https://generativelanguage.googleapis.com/v1beta/openai/`) and model `gemini-3.6-flash`

### 2.2 OpenAI Function Calling Schema Standard
OpenAI tools follow the standard schema:
```typescript
{
  type: "function",
  function: {
    name: string,
    description: string,
    parameters: {
      type: "object",
      properties: {
        [key: string]: {
          type: "string" | "number" | "boolean" | "array" | "object",
          description: string,
          enum?: string[]
        }
      },
      required?: string[]
    }
  }
}
```

---

## 3. Detailed Tool Specifications (JSON Schemas)

Here are the exact 7 tool schemas to provide to `tools: [...]`:

### 3.1 `create_teacher`
- **Name:** `create_teacher`
- **Description:** `"Sistemə yeni müəllim əlavə et (ad, telefon, email, fənn/ixtisas və baza maaş ilə)"`
- **Parameters:**
```json
{
  "type": "function",
  "function": {
    "name": "create_teacher",
    "description": "Sistemə yeni müəllim əlavə et (ad, telefon, email, fənn/ixtisas və baza maaş ilə)",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Müəllimin tam adı və soyadı (məsələn: 'Əli Məmmədov')"
        },
        "phone": {
          "type": "string",
          "description": "Müəllimin əlaqə nömrəsi (məsələn: '+994501234567')"
        },
        "email": {
          "type": "string",
          "description": "Müəllimin email ünvanı (məsələn: 'ali@thrive.edu.az')"
        },
        "subject": {
          "type": "string",
          "description": "Tədris etdiyi fənn və ya ixtisas (məsələn: 'İngilis dili', 'Riyaziyyat', 'IELTS')"
        },
        "base_salary": {
          "type": "number",
          "description": "Aylıq baza maaş məbləği AZN ilə (məsələn: 800)"
        }
      },
      "required": ["name"]
    }
  }
}
```

### 3.2 `create_student`
- **Name:** `create_student`
- **Description:** `"Sistemə yeni tələbə əlavə et (ad, soyad, telefon, fin, sinif və valideyn nömrəsi ilə)"`
- **Parameters:**
```json
{
  "type": "function",
  "function": {
    "name": "create_student",
    "description": "Sistemə yeni tələbə əlavə et (ad, soyad, telefon, fin, sinif və valideyn nömrəsi ilə)",
    "parameters": {
      "type": "object",
      "properties": {
        "first_name": {
          "type": "string",
          "description": "Tələbənin adı (məsələn: 'Murad')"
        },
        "last_name": {
          "type": "string",
          "description": "Tələbənin soyadı (məsələn: 'Qasımov')"
        },
        "phone": {
          "type": "string",
          "description": "Tələbənin əlaqə nömrəsi (məsələn: '+994551234567')"
        },
        "fin": {
          "type": "string",
          "description": "Şəxsiyyət vəsiqəsinin 7 simvollu FİN kodu (məsələn: '7ABC123')"
        },
        "grade": {
          "type": "string",
          "description": "Sinif və ya təhsil səviyyəsi (məsələn: '10-cu sinif', 'General English B2')"
        },
        "parent_phone": {
          "type": "string",
          "description": "Valideynin əlaqə nömrəsi (məsələn: '+994509876543')"
        }
      },
      "required": ["first_name"]
    }
  }
}
```

### 3.3 `create_group`
- **Name:** `create_group`
- **Description:** `"Sistemdə yeni tədris qrupu yarat (ad, müəllim, cədvəl, fənn və qiymət ilə)"`
- **Parameters:**
```json
{
  "type": "function",
  "function": {
    "name": "create_group",
    "description": "Sistemdə yeni tədris qrupu yarat (ad, müəllim, cədvəl, fənn və qiymət ilə)",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Qrupun adı (məsələn: 'IELTS Intensive Group A')"
        },
        "teacher_id": {
          "type": "string",
          "description": "Qrupa təyin ediləcək müəllimin ID-si və ya adı"
        },
        "schedule": {
          "type": "string",
          "description": "Dərs günləri və saatları (məsələn: 'Bazar ertəsi, Çərşənbə 10:00-12:00')"
        },
        "subject": {
          "type": "string",
          "description": "Fənn və ya proqram adı (məsələn: 'IELTS', 'General English')"
        },
        "price": {
          "type": "number",
          "description": "Aylıq təhsil haqqı qiyməti AZN ilə (məsələn: 150)"
        }
      },
      "required": ["name"]
    }
  }
}
```

### 3.4 `get_teachers`
- **Name:** `get_teachers`
- **Description:** `"Sistemdəki bütün müəllimlərin siyahısını, ixtisaslarını və aktiv qruplarını gətir"`
- **Parameters:**
```json
{
  "type": "function",
  "function": {
    "name": "get_teachers",
    "description": "Sistemdəki bütün müəllimlərin siyahısını, ixtisaslarını və aktiv qruplarını gətir",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  }
}
```

### 3.5 `get_students`
- **Name:** `get_students`
- **Description:** `"Sistemdəki qeydiyyatdan keçmiş tələbələrin siyahısını və əlaqə məlumatlarını gətir"`
- **Parameters:**
```json
{
  "type": "function",
  "function": {
    "name": "get_students",
    "description": "Sistemdəki qeydiyyatdan keçmiş tələbələrin siyahısını və əlaqə məlumatlarını gətir",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  }
}
```

### 3.6 `create_lead` (Existing)
```json
{
  "type": "function",
  "function": {
    "name": "create_lead",
    "description": "Yeni Lead (potensial müştəri) yarat",
    "parameters": {
      "type": "object",
      "properties": {
        "name": { "type": "string", "description": "Tam ad" },
        "phone": { "type": "string", "description": "Telefon nömrəsi" },
        "email": { "type": "string", "description": "Email ünvanı" },
        "source": { "type": "string", "description": "Mənbə (məsələn, 'Instagram', 'Tövsiyə')" }
      },
      "required": ["name", "phone"]
    }
  }
}
```

### 3.7 `get_financial_stats` (Existing)
```json
{
  "type": "function",
  "function": {
    "name": "get_financial_stats",
    "description": "Ümumi maliyyə (gəlir, borc) statistikasını gətir",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  }
}
```

---

## 4. Database Execution Logic & SQL Implementation

All database operations leverage PostgreSQL transactions (`sql.begin`) or parameterized queries via the `sql` helper from `@/lib/db`.

### 4.1 `createTeacher(args)`
Creates the authenticated user, profile, teacher record, and user role:
```typescript
async function createTeacher(args: any) {
  try {
    if (!args.name || !args.name.trim()) {
      return { success: false, error: "Müəllimin adı qeyd edilməlidir (name is required)." };
    }

    const nameParts = args.name.trim().split(" ");
    const firstName = nameParts[0] || "Müəllim";
    const lastName = nameParts.slice(1).join(" ") || "";

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const teacherId = crypto.randomUUID();

    const emailToUse = (args.email && args.email.trim())
      ? args.email.trim().toLowerCase()
      : `teacher_${userId.substring(0, 8)}@thrive.az`;

    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx) => {
      const existingUser = await tx`SELECT id FROM auth.users WHERE email = ${emailToUse}`;
      let finalUserId = userId;
      if (existingUser.length > 0) {
        finalUserId = existingUser[0].id;
      } else {
        await tx`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${userId}, ${emailToUse}, 'teacher', 'authenticated', ${hashedPassword})
        `;
      }

      await tx`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
        VALUES (${profileId}, ${finalUserId}, ${firstName}, ${lastName}, ${emailToUse}, ${args.phone || null})
      `;

      await tx`
        INSERT INTO teachers (id, profile_id, specialization)
        VALUES (${teacherId}, ${profileId}, ${args.subject || null})
      `;

      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${finalUserId}, 'teacher')
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
        subject: args.subject || null,
        base_salary: args.base_salary || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### 4.2 `createStudent(args)`
Creates the student, user profile, auth user, role, and optional parent linkage:
```typescript
async function createStudent(args: any) {
  try {
    if (!args.first_name || !args.first_name.trim()) {
      return { success: false, error: "Tələbənin adı qeyd edilməlidir (first_name is required)." };
    }

    const firstName = args.first_name.trim();
    const lastName = (args.last_name || "").trim();

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    const emailToUse = `student_${userId.substring(0, 8)}@thrive.az`;
    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx) => {
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

      if (args.fin || args.parent_phone) {
        const parentProfileId = crypto.randomUUID();
        const parentId = crypto.randomUUID();
        const parentUserId = crypto.randomUUID();
        const parentEmail = `parent_${parentId.substring(0, 8)}@thrive.az`;

        await tx`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${parentUserId}, ${parentEmail}, 'parent', 'authenticated', ${hashedPassword})
          ON CONFLICT (email) DO NOTHING
        `;

        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${parentProfileId}, ${parentUserId}, ${'Valideyn (' + firstName + ')'}, ${lastName}, ${parentEmail}, ${args.parent_phone || null})
        `;

        await tx`
          INSERT INTO parents (id, profile_id, fin_code)
          VALUES (${parentId}, ${profileId}, ${args.fin || null})
        `;
      }

      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${userId}, 'student')
        ON CONFLICT (user_id) DO NOTHING
      `;
    });

    return {
      success: true,
      student: {
        id: studentId,
        name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
        phone: args.phone || null,
        fin: args.fin || null,
        grade: args.grade || null,
        parent_phone: args.parent_phone || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### 4.3 `createGroup(args)`
Resolves or creates program by subject, resolves teacher by UUID or name, and inserts the group and schedule record:
```typescript
async function createGroup(args: any) {
  try {
    if (!args.name || !args.name.trim()) {
      return { success: false, error: "Qrupun adı qeyd edilməlidir (name is required)." };
    }

    let programId: string | null = null;
    if (args.subject && args.subject.trim()) {
      const existingProg = await sql`
        SELECT id FROM programs WHERE LOWER(name) = LOWER(${args.subject.trim()}) AND deleted_at IS NULL LIMIT 1
      `;
      if (existingProg.length > 0) {
        programId = existingProg[0].id;
      } else {
        const newProg = await sql`
          INSERT INTO programs (name) VALUES (${args.subject.trim()}) RETURNING id
        `;
        programId = newProg[0].id;
      }
    }

    let resolvedTeacherId: string | null = null;
    if (args.teacher_id && String(args.teacher_id).trim()) {
      const inputTeacher = String(args.teacher_id).trim();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inputTeacher);
      if (isUUID) {
        resolvedTeacherId = inputTeacher;
      } else {
        const teacherMatch = await sql`
          SELECT t.id, t.profile_id, p.user_id 
          FROM teachers t
          LEFT JOIN user_profiles p ON t.profile_id = p.id
          WHERE p.first_name ILIKE ${'%' + inputTeacher + '%'} 
             OR p.last_name ILIKE ${'%' + inputTeacher + '%'}
             OR (p.first_name || ' ' || p.last_name) ILIKE ${'%' + inputTeacher + '%'}
          LIMIT 1
        `;
        if (teacherMatch.length > 0) {
          resolvedTeacherId = teacherMatch[0].user_id || teacherMatch[0].id;
        }
      }
    }

    const inserted = await sql`
      INSERT INTO groups (name, program_id, teacher_id, room)
      VALUES (${args.name.trim()}, ${programId}, ${resolvedTeacherId}, 'Room 101')
      RETURNING *
    `;

    const group = inserted[0];

    return {
      success: true,
      group: {
        id: group.id,
        name: group.name,
        subject: args.subject || null,
        teacher_id: resolvedTeacherId,
        schedule: args.schedule || null,
        price: args.price || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### 4.4 `getTeachers()`
```typescript
async function getTeachers() {
  try {
    const teachers = await sql`
      SELECT 
        t.id, 
        t.specialization, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone,
        p.user_id,
        (
          SELECT COUNT(*)::int 
          FROM groups g 
          WHERE g.teacher_id = p.user_id 
             OR g.teacher_id = t.id 
             OR g.teacher_id = t.profile_id
        ) as active_groups
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      ORDER BY t.created_at DESC
    `;

    const formatted = teachers.map((t: any) => ({
      id: t.id,
      name: `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir",
      email: t.email || "",
      phone: t.phone || "",
      subject: t.specialization || "Təyin edilməyib",
      activeGroups: Number(t.active_groups) || 0
    }));

    return { success: true, count: formatted.length, teachers: formatted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### 4.5 `getStudents()`
```typescript
async function getStudents() {
  try {
    const students = await sql`
      SELECT 
        s.id, 
        s.created_at, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `;

    const formatted = students.map((s: any) => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
      first_name: s.first_name || "",
      last_name: s.last_name || "",
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

## 5. Dual-Client Fallback Architecture

### 5.1 Configuration
```typescript
// Primary Client (Gemini OpenAI Compatible API)
const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || "missing-key-during-build"
});

// Fallback Client (OpenRouter API)
const fallbackClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "missing-key"
});
```

### 5.2 Dynamic Client Selection & Failover Flow
1. Start with `activeClient = client` and `activeModel = "gemini-3.6-flash"`.
2. Wrap first completion call in `try / catch`:
   - If Gemini succeeds: proceed with `activeClient = client`.
   - If Gemini fails: log warning, switch `activeClient = fallbackClient`, `activeModel = "openai/gpt-4o"`, and execute the first call on OpenRouter.
3. If tool calls are generated:
   - Execute all tools and append responses to `finalMessages`.
   - Execute the second completion call using `activeClient` and `activeModel`.
   - If second call fails with primary client, automatically attempt fallback on OpenRouter.

---

## 6. Execution Pipeline, Error Handling & `finalMessages` Construction

### 6.1 `finalMessages` Construction
- Initial: `[systemMessage, ...messages]`
- When tool calls returned:
  1. `finalMessages.push(aiMessage as any)` (Assistant message with `tool_calls`)
  2. For each tool call in `aiMessage.tool_calls`:
     ```typescript
     finalMessages.push({
       role: "tool",
       tool_call_id: toolCall.id,
       name: fnName,
       content: JSON.stringify(result)
     } as any);
     ```
  3. Send `finalMessages` to second completion call.

### 6.2 Error Resilience
- Tool argument JSON parsing is guarded with `try / catch`. If parsing fails, empty `{}` is passed or an error is returned.
- Database execution errors do not crash the route; they return `{ success: false, error: message }` in the tool message, allowing the LLM to explain the issue to the user naturally.
- Top-level `try / catch` ensures a valid JSON 500 response if unexpected runtime exceptions occur.

---

## 7. Complete Proposed Implementation for `src/app/api/ai/route.ts`

```typescript
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow longer execution times just in case
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import sql from "@/lib/db";
import bcrypt from "bcrypt";

// Primary Client (Gemini)
const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || "missing-key-during-build"
});

// Fallback Client (OpenRouter)
const fallbackClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "missing-key"
});

// Define tools
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
      description: "Sistemə yeni müəllim əlavə et",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Müəllimin tam adı və soyadı (məsələn: 'Əli Məmmədov')" },
          phone: { type: "string", description: "Müəllimin əlaqə nömrəsi (məsələn: '+994501234567')" },
          email: { type: "string", description: "Müəllimin email ünvanı (məsələn: 'ali@thrive.edu.az')" },
          subject: { type: "string", description: "Tədris etdiyi fənn və ya ixtisas (məsələn: 'İngilis dili', 'Riyaziyyat', 'IELTS')" },
          base_salary: { type: "number", description: "Aylıq baza maaş məbləği AZN ilə (məsələn: 800)" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_student",
      description: "Sistemə yeni tələbə əlavə et",
      parameters: {
        type: "object",
        properties: {
          first_name: { type: "string", description: "Tələbənin adı (məsələn: 'Murad')" },
          last_name: { type: "string", description: "Tələbənin soyadı (məsələn: 'Qasımov')" },
          phone: { type: "string", description: "Tələbənin əlaqə nömrəsi (məsələn: '+994551234567')" },
          fin: { type: "string", description: "Şəxsiyyət vəsiqəsinin FİN kodu (məsələn: '7ABC123')" },
          grade: { type: "string", description: "Sinif və ya təhsil səviyyəsi (məsələn: '10-cu sinif', 'General English B2')" },
          parent_phone: { type: "string", description: "Valideynin əlaqə nömrəsi (məsələn: '+994509876543')" }
        },
        required: ["first_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_group",
      description: "Sistemdə yeni tədris qrupu yarat",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Qrupun adı (məsələn: 'IELTS Intensive Group A')" },
          teacher_id: { type: "string", description: "Qrupa təyin ediləcək müəllimin ID-si və ya adı" },
          schedule: { type: "string", description: "Dərs cədvəli və saatları (məsələn: 'Bazar ertəsi, Çərşənbə 10:00-12:00')" },
          subject: { type: "string", description: "Fənn və ya proqram adı (məsələn: 'IELTS', 'General English')" },
          price: { type: "number", description: "Aylıq təhsil haqqı qiyməti AZN ilə (məsələn: 150)" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_teachers",
      description: "Sistemdəki bütün müəllimlərin siyahısını, ixtisaslarını və aktiv qruplarını gətir",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_students",
      description: "Sistemdəki qeydiyyatdan keçmiş tələbələrin siyahısını və əlaqə məlumatlarını gətir",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

// Function executors
async function createLead(args: any) {
  try {
    const validStatus = "NEW";
    const inserted = await sql`
      INSERT INTO leads (name, phone, email, source, status)
      VALUES (${args.name}, ${args.phone}, ${args.email || null}, ${args.source || 'Digər'}, ${validStatus})
      RETURNING *
    `;
    return { success: true, lead: inserted[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function getFinancialStats() {
  try {
    const invoices = await sql`SELECT amount, status FROM invoices`;
    const payments = await sql`SELECT SUM(amount) as total_paid FROM payments`;
    
    const totalPaid = Number(payments[0]?.total_paid) || 0;
    
    let totalExpected = 0;
    invoices.forEach((inv: any) => {
      totalExpected += Number(inv.amount);
    });

    const totalDebt = Math.max(0, totalExpected - totalPaid);
    
    return { 
      monthlyIncome: totalPaid, 
      totalDebt: totalDebt 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createTeacher(args: any) {
  try {
    if (!args.name || !args.name.trim()) {
      return { success: false, error: "Müəllimin adı qeyd edilməlidir (name is required)." };
    }

    const nameParts = args.name.trim().split(" ");
    const firstName = nameParts[0] || "Müəllim";
    const lastName = nameParts.slice(1).join(" ") || "";

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const teacherId = crypto.randomUUID();

    const emailToUse = (args.email && args.email.trim())
      ? args.email.trim().toLowerCase()
      : `teacher_${userId.substring(0, 8)}@thrive.az`;

    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx) => {
      const existingUser = await tx`SELECT id FROM auth.users WHERE email = ${emailToUse}`;
      let finalUserId = userId;
      if (existingUser.length > 0) {
        finalUserId = existingUser[0].id;
      } else {
        await tx`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${userId}, ${emailToUse}, 'teacher', 'authenticated', ${hashedPassword})
        `;
      }

      await tx`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
        VALUES (${profileId}, ${finalUserId}, ${firstName}, ${lastName}, ${emailToUse}, ${args.phone || null})
      `;

      await tx`
        INSERT INTO teachers (id, profile_id, specialization)
        VALUES (${teacherId}, ${profileId}, ${args.subject || null})
      `;

      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${finalUserId}, 'teacher')
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
        subject: args.subject || null,
        base_salary: args.base_salary || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createStudent(args: any) {
  try {
    if (!args.first_name || !args.first_name.trim()) {
      return { success: false, error: "Tələbənin adı qeyd edilməlidir (first_name is required)." };
    }

    const firstName = args.first_name.trim();
    const lastName = (args.last_name || "").trim();

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    const emailToUse = `student_${userId.substring(0, 8)}@thrive.az`;
    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx) => {
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

      if (args.fin || args.parent_phone) {
        const parentProfileId = crypto.randomUUID();
        const parentId = crypto.randomUUID();
        const parentUserId = crypto.randomUUID();
        const parentEmail = `parent_${parentId.substring(0, 8)}@thrive.az`;

        await tx`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${parentUserId}, ${parentEmail}, 'parent', 'authenticated', ${hashedPassword})
          ON CONFLICT (email) DO NOTHING
        `;

        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${parentProfileId}, ${parentUserId}, ${'Valideyn (' + firstName + ')'}, ${lastName}, ${parentEmail}, ${args.parent_phone || null})
        `;

        await tx`
          INSERT INTO parents (id, profile_id, fin_code)
          VALUES (${parentId}, ${profileId}, ${args.fin || null})
        `;
      }

      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${userId}, 'student')
        ON CONFLICT (user_id) DO NOTHING
      `;
    });

    return {
      success: true,
      student: {
        id: studentId,
        name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
        phone: args.phone || null,
        fin: args.fin || null,
        grade: args.grade || null,
        parent_phone: args.parent_phone || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createGroup(args: any) {
  try {
    if (!args.name || !args.name.trim()) {
      return { success: false, error: "Qrupun adı qeyd edilməlidir (name is required)." };
    }

    let programId: string | null = null;
    if (args.subject && args.subject.trim()) {
      const existingProg = await sql`
        SELECT id FROM programs WHERE LOWER(name) = LOWER(${args.subject.trim()}) AND deleted_at IS NULL LIMIT 1
      `;
      if (existingProg.length > 0) {
        programId = existingProg[0].id;
      } else {
        const newProg = await sql`
          INSERT INTO programs (name) VALUES (${args.subject.trim()}) RETURNING id
        `;
        programId = newProg[0].id;
      }
    }

    let resolvedTeacherId: string | null = null;
    if (args.teacher_id && String(args.teacher_id).trim()) {
      const inputTeacher = String(args.teacher_id).trim();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inputTeacher);
      if (isUUID) {
        resolvedTeacherId = inputTeacher;
      } else {
        const teacherMatch = await sql`
          SELECT t.id, t.profile_id, p.user_id 
          FROM teachers t
          LEFT JOIN user_profiles p ON t.profile_id = p.id
          WHERE p.first_name ILIKE ${'%' + inputTeacher + '%'} 
             OR p.last_name ILIKE ${'%' + inputTeacher + '%'}
             OR (p.first_name || ' ' || p.last_name) ILIKE ${'%' + inputTeacher + '%'}
          LIMIT 1
        `;
        if (teacherMatch.length > 0) {
          resolvedTeacherId = teacherMatch[0].user_id || teacherMatch[0].id;
        }
      }
    }

    const inserted = await sql`
      INSERT INTO groups (name, program_id, teacher_id, room)
      VALUES (${args.name.trim()}, ${programId}, ${resolvedTeacherId}, 'Room 101')
      RETURNING *
    `;

    const group = inserted[0];

    return {
      success: true,
      group: {
        id: group.id,
        name: group.name,
        subject: args.subject || null,
        teacher_id: resolvedTeacherId,
        schedule: args.schedule || null,
        price: args.price || null
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function getTeachers() {
  try {
    const teachers = await sql`
      SELECT 
        t.id, 
        t.specialization, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone,
        p.user_id,
        (
          SELECT COUNT(*)::int 
          FROM groups g 
          WHERE g.teacher_id = p.user_id 
             OR g.teacher_id = t.id 
             OR g.teacher_id = t.profile_id
        ) as active_groups
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      ORDER BY t.created_at DESC
    `;

    const formatted = teachers.map((t: any) => ({
      id: t.id,
      name: `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir",
      email: t.email || "",
      phone: t.phone || "",
      subject: t.specialization || "Təyin edilməyib",
      activeGroups: Number(t.active_groups) || 0
    }));

    return { success: true, count: formatted.length, teachers: formatted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function getStudents() {
  try {
    const students = await sql`
      SELECT 
        s.id, 
        s.created_at, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `;

    const formatted = students.map((s: any) => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
      first_name: s.first_name || "",
      last_name: s.last_name || "",
      email: s.email || "",
      phone: s.phone || "",
      joinDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : ""
    }));

    return { success: true, count: formatted.length, students: formatted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemMessage = {
      role: "system",
      content: "Sən Thrive CRM-in ağıllı və rəsmi köməkçisisən. Sən istifadəçinin yazdığı dilə uyğun olaraq Azərbaycan, Rus və ya İngilis dillərində səlis və mehriban cavab verirsən. Sən funksiyalardan istifadə edərək sistemdən məlumat ala, tələbə, müəllim, qrup və lead yarada bilərsən. Əgər hər hansı parametr çatışmırsa və ya əməliyyat uğurla başa çatdısa, istifadəçiyə aydın və nəzakətli şəkildə məlumat ver."
    };

    const finalMessages = [systemMessage, ...messages];

    let activeClient = client;
    let activeModel = "gemini-3.6-flash";
    let response: any;

    try {
      response = await client.chat.completions.create({
        model: "gemini-3.6-flash",
        messages: finalMessages,
        tools: tools as any,
        max_tokens: 1024,
      });
    } catch (primaryErr) {
      console.warn("Primary AI call (Gemini) failed, falling back to OpenRouter:", primaryErr);
      activeClient = fallbackClient;
      activeModel = "openai/gpt-4o";
      response = await fallbackClient.chat.completions.create({
        model: "openai/gpt-4o",
        messages: finalMessages,
        tools: tools as any,
        max_tokens: 1024,
      });
    }

    let aiMessage = response.choices[0].message;

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      finalMessages.push(aiMessage as any); // Add the assistant's tool call message

      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.type === "function") {
          const fnName = toolCall.function.name;
          let args: any = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch (parseError: any) {
            console.error(`Failed to parse arguments for tool ${fnName}:`, parseError);
            args = {};
          }

          let result: any;
          try {
            switch (fnName) {
              case "create_lead":
                result = await createLead(args);
                break;
              case "get_financial_stats":
                result = await getFinancialStats();
                break;
              case "create_teacher":
                result = await createTeacher(args);
                break;
              case "create_student":
                result = await createStudent(args);
                break;
              case "create_group":
                result = await createGroup(args);
                break;
              case "get_teachers":
                result = await getTeachers();
                break;
              case "get_students":
                result = await getStudents();
                break;
              default:
                result = { success: false, error: `Bilinməyən funksiya: ${fnName}` };
            }
          } catch (execError: any) {
            console.error(`Error executing tool ${fnName}:`, execError);
            result = { success: false, error: execError.message || "Funksiya icra olunarkən xəta baş verdi" };
          }

          finalMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: fnName,
            content: JSON.stringify(result)
          } as any);
        }
      }

      // Call AI again to generate final natural language response
      try {
        const secondResponse = await activeClient.chat.completions.create({
          model: activeModel,
          messages: finalMessages,
          max_tokens: 1024,
        });
        aiMessage = secondResponse.choices[0].message;
      } catch (secondErr) {
        if (activeClient !== fallbackClient) {
          console.warn("Second AI call on primary client failed, trying fallback client:", secondErr);
          const fallbackSecondResponse = await fallbackClient.chat.completions.create({
            model: "openai/gpt-4o",
            messages: finalMessages,
            max_tokens: 1024,
          });
          aiMessage = fallbackSecondResponse.choices[0].message;
        } else {
          throw secondErr;
        }
      }
    }

    return NextResponse.json({ content: aiMessage.content || "" });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to communicate with AI" }, { status: 500 });
  }
}
```
