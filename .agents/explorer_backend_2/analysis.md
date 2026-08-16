# Technical Analysis: Database Architecture, Schemas, and AI Tool Implementation

**Agent**: Explorer Backend 2  
**Date**: 2026-08-16  
**Scope**: Database Client (`@/lib/db`), Schemas (`teachers`, `students`, `groups`, `user_profiles`, `auth.users`, `programs`), API Query Patterns, and AI Tool Implementations.

---

## 1. Database Connection & Helper (`@/lib/db`)

### 1.1 Implementation Details
The file `src/lib/db.ts` uses the `postgres` library (v3.4.9) configured for connection pooling (PgBouncer) on serverless runtimes:

```typescript
// src/lib/db.ts
import postgres from "postgres";

const connectionUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;

const sql = connectionUrl 
  ? postgres(connectionUrl, {
      ssl: "require",
      prepare: false,
    }) 
  : (new Proxy(() => {}, {
      apply: () => { throw new Error("DATABASE_URL is not set in Vercel Environment Variables"); }
    }) as any);

export default sql;
```

### 1.2 Import & Usage Conventions
- **Export type**: Default export (`export default sql;`).
- **Import convention**: `import sql from "@/lib/db";`
- **Tagged Template Querying**:
  ```typescript
  const rows = await sql`SELECT * FROM table_name WHERE id = ${id}`;
  ```
- **Transactions**:
  ```typescript
  await sql.begin(async (tx) => {
    await tx`INSERT INTO table_a ...`;
    await tx`INSERT INTO table_b ...`;
  });
  ```
- **Insertion with Return**:
  ```typescript
  const inserted = await sql`
    INSERT INTO table_name (col1, col2)
    VALUES (${val1}, ${val2})
    RETURNING *
  `;
  const record = inserted[0];
  ```

---

## 2. Database Schema & Architecture

The database architecture decouples authentication (`auth.users`) and demographic information (`user_profiles`) from role-specific entities (`teachers`, `students`, `parents`).

### 2.1 Core Relational Tables

#### 1. `auth.users`
- **Columns**:
  - `id`: `UUID PRIMARY KEY`
  - `email`: `TEXT UNIQUE`
  - `role`: `TEXT` (e.g. `'teacher'`, `'student'`, `'admin'`, `'authenticated'`)
  - `aud`: `TEXT` (default `'authenticated'`)
  - `encrypted_password`: `TEXT` (bcrypt hashed password)
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 2. `user_profiles`
- **Columns**:
  - `id`: `UUID PRIMARY KEY` (or `DEFAULT uuid_generate_v4()`)
  - `user_id`: `UUID REFERENCES auth.users(id) ON DELETE CASCADE`
  - `first_name`: `TEXT`
  - `last_name`: `TEXT`
  - `email`: `TEXT`
  - `phone`: `TEXT`
  - `fin_code`: `TEXT`
  - `id_card_number`: `TEXT`
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 3. `user_roles`
- **Columns**:
  - `user_id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  - `role`: `TEXT NOT NULL`
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 4. `teachers`
- **Columns**:
  - `id`: `UUID PRIMARY KEY` (or `DEFAULT uuid_generate_v4()`)
  - `profile_id`: `UUID REFERENCES user_profiles(id) ON DELETE CASCADE`
  - `specialization`: `TEXT` (represents subject / specialty, e.g. "İngilis Dili", "IELTS", "Riyaziyyat")
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 5. `students`
- **Columns**:
  - `id`: `UUID PRIMARY KEY` (or `DEFAULT uuid_generate_v4()`)
  - `profile_id`: `UUID REFERENCES user_profiles(id) ON DELETE CASCADE`
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 6. `groups`
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `name`: `TEXT NOT NULL`
  - `program_id`: `UUID REFERENCES programs(id) ON DELETE SET NULL`
  - `teacher_id`: `UUID REFERENCES auth.users(id)` (or `teachers.id` / `user_profiles.user_id`)
  - `room`: `TEXT`
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 7. `programs`
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `name`: `TEXT NOT NULL`
  - `description`: `TEXT`
  - `duration_months`: `INT`
  - `deleted_at`: `TIMESTAMPTZ`
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 8. `group_schedules`
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `group_id`: `UUID REFERENCES groups(id) ON DELETE CASCADE`
  - `day_of_week`: `INT NOT NULL` (1=Mon, ..., 7=Sun)
  - `start_time`: `TEXT` / `TIME NOT NULL`
  - `end_time`: `TEXT` / `TIME NOT NULL`
  - `room`: `TEXT`
  - `teacher_id`: `UUID`
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

#### 9. `leads`
- **Columns**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `name`: `TEXT NOT NULL`
  - `phone`: `TEXT NOT NULL`
  - `email`: `TEXT`
  - `source`: `TEXT`
  - `status`: `TEXT NOT NULL DEFAULT 'NEW'`
  - `notes`: `TEXT`
  - `next_follow_up`: `TIMESTAMPTZ`
  - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`

---

## 3. Detailed Field Mapping & Query Patterns

### 3.1 `teachers` Table & Entities
| AI Tool Field | Target Column / Table | Handling Logic |
|---|---|---|
| `name` | `user_profiles.first_name`, `user_profiles.last_name` | Split by space: `firstName = parts[0]`, `lastName = parts.slice(1).join(' ')` |
| `phone` | `user_profiles.phone` | Store directly in `user_profiles` |
| `email` | `auth.users.email`, `user_profiles.email` | Lowercase & trim; if omitted, generate unique placeholder `${userId.substring(0,8)}@thrive.az` |
| `subject` | `teachers.specialization` | Store in `specialization` column |
| `base_salary` | Return/Metadata | Passed through tool result; can be preserved in AI context |

#### Read Query Pattern (`get_teachers`):
```sql
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
```

#### Creation Pattern (`create_teacher`):
```typescript
const userId = crypto.randomUUID();
const profileId = crypto.randomUUID();
const teacherId = crypto.randomUUID();
const hashedPassword = await bcrypt.hash("123456", 10);

await sql.begin(async (tx) => {
  await tx`
    INSERT INTO auth.users (id, email, role, aud, encrypted_password)
    VALUES (${userId}, ${emailToUse}, 'teacher', 'authenticated', ${hashedPassword})
  `;
  await tx`
    INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
    VALUES (${profileId}, ${userId}, ${firstName}, ${lastName}, ${emailToUse}, ${phone || null})
  `;
  await tx`
    INSERT INTO teachers (id, profile_id, specialization)
    VALUES (${teacherId}, ${profileId}, ${subject || null})
  `;
  await tx`
    INSERT INTO user_roles (user_id, role)
    VALUES (${userId}, 'teacher')
    ON CONFLICT (user_id) DO UPDATE SET role = 'teacher'
  `;
});
```

---

### 3.2 `students` Table & Entities
| AI Tool Field | Target Column / Table | Handling Logic |
|---|---|---|
| `first_name` | `user_profiles.first_name` | Direct insert into `user_profiles` |
| `last_name` | `user_profiles.last_name` | Direct insert into `user_profiles` |
| `phone` | `user_profiles.phone` | Direct insert into `user_profiles` |
| `fin` | `user_profiles.fin_code` | Direct insert into `user_profiles` |
| `grade` | Metadata / Notes | Preserved in AI response payload |
| `parent_phone` | `user_profiles` / `parents` | Preserved in response & parent metadata |

#### Read Query Pattern (`get_students`):
```sql
SELECT 
  s.id, 
  s.created_at, 
  p.first_name, 
  p.last_name, 
  p.email, 
  p.phone,
  p.fin_code
FROM students s
LEFT JOIN user_profiles p ON s.profile_id = p.id
ORDER BY s.created_at DESC
```

#### Creation Pattern (`create_student`):
```typescript
const userId = crypto.randomUUID();
const profileId = crypto.randomUUID();
const studentId = crypto.randomUUID();
const hashedPassword = await bcrypt.hash("123456", 10);
const emailToUse = `${userId.substring(0, 8)}@student.thrive.az`;

await sql.begin(async (tx) => {
  await tx`
    INSERT INTO auth.users (id, email, role, aud, encrypted_password)
    VALUES (${userId}, ${emailToUse}, 'student', 'authenticated', ${hashedPassword})
  `;
  await tx`
    INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone, fin_code)
    VALUES (${profileId}, ${userId}, ${firstName}, ${lastName}, ${emailToUse}, ${phone || null}, ${fin || null})
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
});
```

---

### 3.3 `groups` Table & Entities
| AI Tool Field | Target Column / Table | Handling Logic |
|---|---|---|
| `name` | `groups.name` | Direct insert into `groups` |
| `teacher_id` | `groups.teacher_id` | Resolve teacher user ID or UUID |
| `subject` | `programs.id` | Match existing program by name or create new in `programs` table |
| `schedule` | `group_schedules` | Record into `group_schedules` or return |
| `price` | Metadata / Invoices | Preserved in group record |

#### Creation Pattern (`create_group`):
```typescript
let programId = null;
if (args.subject) {
  const existingProg = await sql`
    SELECT id FROM programs 
    WHERE name ILIKE ${args.subject} AND deleted_at IS NULL 
    LIMIT 1
  `;
  if (existingProg.length > 0) {
    programId = existingProg[0].id;
  } else {
    const newProg = await sql`
      INSERT INTO programs (name) 
      VALUES (${args.subject}) 
      RETURNING id
    `;
    programId = newProg[0]?.id;
  }
}

const createdGroup = await sql`
  INSERT INTO groups (name, program_id, teacher_id, room)
  VALUES (${args.name}, ${programId}, ${args.teacher_id || null}, 'Room 101')
  RETURNING *
`;
```

---

## 4. AI Route Architecture (`src/app/api/ai/route.ts`)

### 4.1 Fallback Client Specification
```typescript
const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || "missing-key-during-build"
});

const fallbackClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "missing-key"
});
```

### 4.2 Error Handling & Fallback Dual-Call Flow
1. Attempt initial completion with `client` and model `"gemini-3.6-flash"`.
2. On catch, switch active client to `fallbackClient` and active model to `"openai/gpt-4o"`.
3. If tool calls are requested:
   - Iterate over `aiMessage.tool_calls`.
   - Dispatch to `create_teacher`, `create_student`, `create_group`, `get_teachers`, `get_students`, `create_lead`, `get_financial_stats`.
   - Push result items with `{ role: "tool", tool_call_id, name, content }`.
   - Execute second completion using the **same active client and model** (primary or fallback).

---

## 5. Summary of Ready-to-Use Tool Definitions

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
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "create_teacher",
      description: "Yeni müəllim əlavə et",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Müəllimin tam adı" },
          phone: { type: "string", description: "Telefon nömrəsi" },
          email: { type: "string", description: "Email ünvanı" },
          subject: { type: "string", description: "Tədris etdiyi fənn / ixtisas" },
          base_salary: { type: "number", description: "Baza əmək haqqı" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_student",
      description: "Yeni tələbə qeydiyyatdan keçir",
      parameters: {
        type: "object",
        properties: {
          first_name: { type: "string", description: "Ad" },
          last_name: { type: "string", description: "Soyad" },
          phone: { type: "string", description: "Telefon nömrəsi" },
          fin: { type: "string", description: "FIN kod" },
          grade: { type: "string", description: "Sinif və ya səviyyə" },
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
          name: { type: "string", description: "Qrupun adı" },
          teacher_id: { type: "string", description: "Müəllimin ID-si (istəyə bağlı)" },
          schedule: { type: "string", description: "Dərs cədvəli (məs: 'B.e / Çərş 10:00')" },
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
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_students",
      description: "Sistemdəki bütün tələbələrin siyahısını gətir",
      parameters: { type: "object", properties: {} }
    }
  }
];
```
