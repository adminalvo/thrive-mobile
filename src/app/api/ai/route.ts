export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow longer execution times for LLM + tool execution
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import sql from "@/lib/db";
import bcrypt from "bcrypt";
import { sendEmail } from "@/lib/email";

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY_PRIMARY || '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const kimiClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY_FALLBACK || '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Define tools available for AI
const tools = [
  {
    type: "function",
    function: {
      name: "create_lead",
      description: "Yeni Lead (potensial müştəri) əlavə et",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Tam ad və soyad" },
          phone: { type: "string", description: "Telefon nömrəsi" },
          email: { type: "string", description: "Email ünvanı" },
          source: { type: "string", description: "Mənbə (məsələn, 'Instagram', 'Facebook', 'Tövsiyə', 'Zəng')" }
        },
        required: ["name", "phone"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_financial_stats",
      description: "Ümumi maliyyə (aylıq gəlir və gözləyən borclar) statistikasını gətir",
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
      description: "Yeni müəllim qeydiyyatdan keçir",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Müəllimin tam adı və soyadı" },
          phone: { type: "string", description: "Telefon nömrəsi" },
          email: { type: "string", description: "Email ünvanı" },
          subject: { type: "string", description: "Tədris etdiyi fənn və ya ixtisas" },
          base_salary: { type: "number", description: "Əsas maaş və ya dərəcə" }
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
          first_name: { type: "string", description: "Tələbənin adı" },
          last_name: { type: "string", description: "Tələbənin soyadı" },
          phone: { type: "string", description: "Tələbənin telefon nömrəsi" },
          fin: { type: "string", description: "FİN kod" },
          grade: { type: "string", description: "Sinif və ya dərəcə" },
          parent_phone: { type: "string", description: "Valideyn telefon nömrəsi" },
          program: { type: "string", description: "Seçilmiş proqram (məsələn, SAT, IELTS, General English)" },
          monthly_payment: { type: "number", description: "Aylıq ödəniş məbləği (məsələn, 150)" }
        },
        required: ["first_name", "last_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_bulk_students",
      description: "Birdən çox tələbəni (siyahı, cədvəl və ya səsli komanda ilə diktə edilmiş siyahı) bir dəfəyə sistemə toplu əlavə et.",
      parameters: {
        type: "object",
        properties: {
          students: {
            type: "array",
            description: "Əlavə ediləcək tələbələrin siyahısı",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Tam ad və soyad (əgər ayrı verilməyibsə)" },
                first_name: { type: "string", description: "Tələbənin adı" },
                last_name: { type: "string", description: "Tələbənin soyadı" },
                phone: { type: "string", description: "Telefon nömrəsi" },
                fin: { type: "string", description: "FİN kod (varsa)" },
                grade: { type: "string", description: "Sinif və ya dərəcə" },
                parent_phone: { type: "string", description: "Valideyn telefon nömrəsi" },
                program: { type: "string", description: "Seçilmiş proqram (məs: SAT, IELTS, General English, Magistratura)" },
                monthly_payment: { type: "number", description: "Aylıq ödəniş məbləği" }
              }
            }
          }
        },
        required: ["students"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_group",
      description: "Yeni qrup yarat",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Qrupun adı" },
          teacher_id: { type: "string", description: "Müəllimin ID-si" },
          schedule: { type: "string", description: "Dərs günləri və saatları" },
          subject: { type: "string", description: "Fənn və ya proqram adı" },
          price: { type: "number", description: "Aylıq ödəniş qiyməti" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_teachers",
      description: "Mərkəzdə qeydiyyatda olan müəllimlərin siyahısını və ixtisaslarını gətir",
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
      description: "Mərkəzdə qeydiyyatda olan tələbələrin siyahısını gətir",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "execute_sql",
      description: "Verilənlər bazasında sərbəst şəkildə PostgreSQL sorğusu (SQL query) icra et.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "İcra ediləcək SQL sorğusu (məsələn: SELECT * FROM users)" }
        },
        required: ["query"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "send_email",
      description: "Müştəriyə, tələbəyə və ya işçiyə email göndər.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Qəbul edənin email ünvanı" },
          subject: { type: "string", description: "Məktubun mövzusu" },
          html: { type: "string", description: "Məktubun mətni (HTML formatında ola bilər)" }
        },
        required: ["to", "subject", "html"]
      }
    }
  }
];

// Tool Executors

async function executeSql(args: any) {
  try {
    const query = (args.query || "").trim();
    if (!query) {
      return { success: false, error: "Boş sorğu icra edilə bilməz." };
    }

    const cleanQuery = query.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '').trim();
    const upper = cleanQuery.toUpperCase();

    // Strict Security Guard: Only allow SELECT or WITH queries (Read-Only)
    if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
      return { 
        success: false, 
        error: "Təhlükəsizlik qaydalarına əsasən yalnız oxuma (SELECT / Read-Only) sorğuları icra edilə bilər. Dəyişiklik əmrləri qadağandır." 
      };
    }

    // Block any destructive DDL/DML keywords even in sub-queries or stacked statements
    const FORBIDDEN_KEYWORDS = [
      "DROP", "DELETE", "TRUNCATE", "ALTER", "GRANT", "REVOKE", 
      "UPDATE", "INSERT", "CREATE", "EXEC", "EXECUTE", "PG_SLEEP", 
      "COPY", "DATABASE", "SCHEMA"
    ];

    for (const kw of FORBIDDEN_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(cleanQuery)) {
        return { 
          success: false, 
          error: `Təhlükəsizlik qaydası: '${kw}' açar sözü olan sorğular bloklandı.` 
        };
      }
    }

    const result = await sql.unsafe(cleanQuery);
    return { 
      success: true, 
      count: result.length, 
      data: result.slice(0, 50) 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createLead(args: any) {
  try {
    const validStatus = "NEW";
    const inserted = await sql`
      INSERT INTO leads (name, phone, email, source, status)
      VALUES (${args.name}, ${args.phone}, ${args.email || null}, ${args.source || 'Digər'}, ${validStatus})
      RETURNING *
    `;
    return { success: true, message: "Lead uğurla yaradıldı", lead: inserted[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function getFinancialStats() {
  try {
    const [payments, expenses] = await Promise.all([
      sql`SELECT amount, paid_amount, status FROM payments`,
      sql`SELECT amount FROM expenses`.catch(() => [])
    ]);
    
    let totalRevenue = 0;
    let totalDebt = 0;
    let totalExpenses = 0;

    payments.forEach((p: any) => {
      const amt = Number(p.amount) || 0;
      const paid = Number(p.paid_amount) || (p.status === 'PAID' ? amt : 0);
      totalRevenue += paid;
      if (p.status === 'PENDING' || p.status === 'OVERDUE') {
        totalDebt += Math.max(0, amt - paid);
      }
    });

    expenses.forEach((e: any) => {
      totalExpenses += Number(e.amount) || 0;
    });

    return { 
      success: true,
      monthlyIncome: totalRevenue, 
      totalDebt: totalDebt,
      totalExpenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createTeacher(args: any) {
  try {
    const nameParts = (args.name || "").trim().split(" ");
    const firstName = nameParts[0] || "Müəllim";
    const lastName = nameParts.slice(1).join(" ") || "";
    const emailToUse = (args.email || `teacher_${Date.now()}@thrive.az`).trim().toLowerCase();

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const teacherId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx: any) => {
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
      message: `Müəllim ${firstName} ${lastName} uğurla qeydiyyata alındı.`,
      teacher: { id: teacherId, name: `${firstName} ${lastName}`, email: emailToUse, specialty: args.subject }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createStudent(args: any) {
  try {
    const firstName = (args.first_name || "Tələbə").trim();
    const lastName = (args.last_name || "").trim();
    const emailToUse = `student_${Date.now()}@thrive.az`;

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const studentId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO auth.users (id, email, role, aud, encrypted_password)
        VALUES (${userId}, ${emailToUse}, 'authenticated', 'authenticated', ${hashedPassword})
      `;

      await tx`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
        VALUES (${profileId}, ${userId}, ${firstName}, ${lastName}, ${emailToUse}, ${args.phone || null})
      `;

      await tx`
        INSERT INTO students (id, profile_id, program, monthly_payment)
        VALUES (${studentId}, ${profileId}, ${args.program || null}, ${args.monthly_payment || null})
      `;

      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${userId}, 'student')
        ON CONFLICT (user_id) DO NOTHING
      `;
    });

    return { 
      success: true, 
      message: `Tələbə ${firstName} ${lastName} uğurla əlavə edildi.`,
      student: { id: studentId, name: `${firstName} ${lastName}`, phone: args.phone }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createBulkStudents(args: any) {
  try {
    const rawList = Array.isArray(args.students) ? args.students : [];
    if (rawList.length === 0) {
      return { success: false, error: "Əlavə ediləcək tələbə siyahısı boşdur." };
    }

    const createdStudents: any[] = [];
    const hashedPassword = await bcrypt.hash("123456", 10);

    await sql.begin(async (tx: any) => {
      for (let i = 0; i < rawList.length; i++) {
        const item = rawList[i];
        const rawName = (item.name || "").trim();
        let firstName = (item.first_name || "").trim();
        let lastName = (item.last_name || "").trim();

        if (!firstName && rawName) {
          const parts = rawName.split(" ");
          firstName = parts[0];
          lastName = parts.slice(1).join(" ");
        }

        firstName = firstName || `Tələbə ${i + 1}`;
        lastName = lastName || "";

        const emailToUse = (item.email || `student_${Date.now()}_${i}_${Math.floor(Math.random()*1000)}@thrive.az`).trim().toLowerCase();
        const userId = crypto.randomUUID();
        const profileId = crypto.randomUUID();
        const studentId = crypto.randomUUID();

        // 1. Auth user
        await tx`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${userId}, ${emailToUse}, 'authenticated', 'authenticated', ${hashedPassword})
          ON CONFLICT (id) DO NOTHING
        `;

        // 2. Profile
        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${profileId}, ${userId}, ${firstName}, ${lastName}, ${emailToUse}, ${item.phone || null})
        `;

        // 3. Student
        await tx`
          INSERT INTO students (id, profile_id, program, monthly_payment, fin_code)
          VALUES (${studentId}, ${profileId}, ${item.program || null}, ${item.monthly_payment || null}, ${item.fin || null})
        `;

        // 4. Role
        await tx`
          INSERT INTO user_roles (user_id, role)
          VALUES (${userId}, 'student')
          ON CONFLICT (user_id) DO NOTHING
        `;

        // 5. Student programs
        if (item.program) {
          try {
            await tx`
              INSERT INTO student_programs (student_id, program_name, status)
              VALUES (${studentId}, ${item.program}, 'ACTIVE')
            `;
          } catch (e) {
            // Ignore if student_programs table constraints
          }
        }

        createdStudents.push({
          id: studentId,
          name: `${firstName} ${lastName}`.trim(),
          phone: item.phone || "—",
          program: item.program || "—",
          monthly_payment: item.monthly_payment || "—"
        });
      }
    });

    return {
      success: true,
      count: createdStudents.length,
      message: `${createdStudents.length} nəfər tələbə bazaya uğurla toplu şəkildə əlavə edildi.`,
      students: createdStudents
    };
  } catch (error: any) {
    console.error("createBulkStudents error:", error);
    return { success: false, error: error.message };
  }
}

async function createGroup(args: any) {
  try {
    let programId: string | null = null;
    if (args.subject) {
      const prog = await sql`SELECT id FROM programs WHERE name ILIKE ${'%' + args.subject + '%'} LIMIT 1`;
      if (prog.length > 0) {
        programId = prog[0].id;
      }
    }

    const inserted = await sql`
      INSERT INTO groups (name, program_id, teacher_id, room)
      VALUES (${args.name}, ${programId}, ${args.teacher_id || null}, ${args.schedule || 'Otaq 1'})
      RETURNING *
    `;

    return { 
      success: true, 
      message: `Qrup '${args.name}' uğurla yaradıldı.`, 
      group: inserted[0] 
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
        (
          SELECT COUNT(*)::int 
          FROM groups g 
          WHERE g.teacher_id = p.user_id 
             OR g.teacher_id = t.id 
             OR g.teacher_id = t.profile_id
        ) as active_groups
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
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

async function getStudents() {
  try {
    const students = await sql`
      SELECT s.id, s.created_at, p.first_name, p.last_name, p.email, p.phone
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 50
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

export async function POST(req: Request) {
  try {
    const { messages, sessionId, moduleFilter } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const { getServerSession } = require("next-auth/next");
    const { authOptions } = require("@/lib/authOptions");
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || "staff";
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email?.toLowerCase() || null;

    let activeSessionId = sessionId;

    // If no session ID provided but user is logged in, auto-create or find active session
    if (!activeSessionId && (userId || userEmail)) {
      try {
        const lastUserMsg = messages[messages.length - 1]?.content;
        const rawText = typeof lastUserMsg === "string" 
          ? lastUserMsg 
          : (Array.isArray(lastUserMsg) ? lastUserMsg[0]?.text || "New Conversation" : "New Conversation");
        
        const autoTitle = rawText.length > 35 ? rawText.substring(0, 35) + "..." : rawText;

        const newSession = await sql`
          INSERT INTO ai_chat_sessions (user_id, user_email, title, module_filter)
          VALUES (${userId}, ${userEmail}, ${autoTitle}, ${moduleFilter || 'ALL'})
          RETURNING id
        `;
        activeSessionId = newSession[0]?.id;
      } catch (e) {
        console.error("Session auto-create error:", e);
      }
    }

    // Save the last user message to database if activeSessionId is present
    const lastUserMessage = messages[messages.length - 1];
    if (activeSessionId && lastUserMessage && lastUserMessage.role === "user") {
      try {
        let textContent = "";
        let imgUrl: string | null = null;
        if (typeof lastUserMessage.content === "string") {
          textContent = lastUserMessage.content;
        } else if (Array.isArray(lastUserMessage.content)) {
          for (const part of lastUserMessage.content) {
            if (part.type === "text") textContent += part.text;
            if (part.type === "image_url") imgUrl = part.image_url.url;
          }
        }

        await sql`
          INSERT INTO ai_chat_messages (session_id, role, content, image_url)
          VALUES (${activeSessionId}, 'user', ${textContent}, ${imgUrl})
        `;
      } catch (e) {
        console.error("Failed to save user message:", e);
      }
    }

    const systemMessage = {
      role: "system",
      content: `You are ThrAIve — the official and fully integrated intelligent assistant of Thrive Education Center and Thrive CRM, powered by Gamma A5 (v1.0.0) developed by HacTag Development. You respond fluently, accurately, politely, and with maximum speed in whatever language the user initiates (Azerbaijani, English, or Russian).

================================================================================
CRITICAL POLICY: STRICT CRM & THRIVE EDUCATION SCOPE
================================================================================
1. You ONLY answer questions related to Thrive Education Center, Thrive CRM, its students, teachers, groups, schedules, subjects/courses, study formats, pricing standards, financial accounts, leads, marketing, tasks, logs, and education center operations.
2. Under NO circumstances should you answer unrelated general knowledge questions, pop culture, recipes, world politics, entertainment, sports results, or general non-CRM chatter.
3. If a user asks an out-of-scope non-CRM question, politely and firmly decline in the user's language:
   - Azerbaijani: "Mən yalnız Thrive Education Center və Thrive CRM üzrə ixtisaslaşmış süni intellekt köməkçisiyəm. Zəhmət olmasa mərkəzimizin tələbələri, müəllimləri, qrupları, dərsləri, cədvəli və ya maliyyəsi ilə bağlı suallarınızı verin."
   - English: "I am an AI assistant dedicated exclusively to Thrive Education Center and Thrive CRM operations. Please ask questions related to our center's students, teachers, groups, schedules, or finance."
   - Russian: "Я являюсь специализированным ИИ-помощником Thrive Education Center и Thrive CRM. Пожалуйста, задавайте вопросы, связанные со студентами, преподавателями, расписанием, группами или финансами нашего центра."

================================================================================
THRIVE EDUCATION CENTER KNOWLEDGE BASE (SYSTEM MEMORY)
================================================================================
Organization: Thrive Education Center (Thrive Tədris Mərkəzi)
Target Audience: Şagirdlər, tələbələr, abituriyentlər, xaricdə təhsil və beynəlxalq imtahanlara hazırlaşanlar.

1. Tədris Proqramları və Fənlər (Academic Programs & Subjects):
- SAT (SAT Math, SAT Verbal, Digital SAT Prep)
- General English (General English - Beginner-dən Advanced-ə qədər bütün səviyyələr)
- IELTS & TOEFL (Pre-IELTS, IELTS Academic, IELTS General, TOEFL iBT)
- Math Olympic (Riyaziyyat Məntiq və Olimpiada Hazırlığı)
- Magistratura və Dövlət Qulluğu (Məntiq, İnformatika, Xarici dil)
- Abituriyent Hazırlığı (I, II, III, IV ixtisas qrupları üzrə blok və buraxılış imtahanları)
- Xarici Dillər: Rus dili, Alman dili, Fransız dili
- Xaricdə Təhsil və Təqaüd Konsultasiyası

2. Tədris Formatları və Standartları (Study Formats & Standards):
- Group (Qrup): 4–12 nəfərlik qruplar (Standart fənn qiymətləri ilə)
- Mini Group (Mini Qrup): 2–5 nəfərlik fərdi yanaşmalı kiçik qruplar
- Individual (Fərdi / Individual): 1 nəfərlik fərdi dərslər
- Tədris Rejimləri:
  * Əyani (Offline) — Mərkəzin təchiz olunmuş sinif otaqlarında
  * Online — Virtual distant dərslər
  * Hibrid (Hybrid) — Həm əyani, həm online tələbələrin eyni vaxtda qatıldığı dərslər

3. 6 Korporativ Bank & Kassa Hesabları (Financial Accounts):
1. ABB Card (Digihesab) — ABB bank rəqəmsal kart hesabı
2. Leobank Register — Leobank kart və qeydiyyat hesabı
3. Nəğd Kassa — Mərkəzin fiziki nağd vəsait kassası
4. Tamerlan Hesab (Director Master) — Rəhbərliyin əsas nəzarət hesabı
5. UBank Register — UBank hesabı
6. POS Terminal (BC) — Bank kartı ilə ödənişlər üçün daxili POS terminal

4. CRM Modulları və İdarəetmə Bacarıqları (CRM Modules & Capabilities):
- Dashboard: Canlı dövriyyə, xalis mənfəət, aktiv tələbə və müəllim sayı, canlı qrafiklər.
- Tələbələr (Students): Tələbə qeydiyyatı, FİN kod, telefon, valideyn telefonu, təhsil aldığı proqramlar, ödəniş statusu (PAID / PENDING / OVERDUE), statuslar (Aktiv, Məzun, Dondurulub, İmtina).
- Müəllimlər (Teachers): Müəllimlərin profilləri, ixtisasları, tədris etdikləri qruplar, maaş və dərəcələr.
- Qruplar (Groups): Qrup yaratma, tələbə əlavə etmə/çıxarma, otaq təyinatı, format (Əyani/Online/Hibrid).
- Cədvəl (Schedule): 7 günlük interaktiv dərs cədvəli (1: Bazar ertəsi - 7: Bazar), saatlar, otaq toqquşması nəzarəti, qrupdakı canlı tələbə reyestri.
- Maliyyə (Finance): Detallı dövr açılışı (6 hesab üzrə ilkin qalıqlar və Şirkət İlkin Açılış Kapitalı), ödəniş qəbulu, xərclər, borcların hesablanması, tələbə ödəniş qəbzləri.
- Satış & Lead-lər (Leads): Mənbələr (Instagram, TikTok, Facebook, Zəng, Tövsiyə, Reklam), Statuslar (Yeni, Əlaqə saxlanılıb, Sınaq dərsində, Qeydiyyatda, Uğurlu, İmtina).
- Tapşırıqlar (Kanban Tasks): TODO (Gözləmədə), IN_PROGRESS (İcrada), REVIEW (Yoxlanışda), DONE (Tamamlandı). Prioritetlər: Aşağı, Orta, Yüksək, Təcili.
- Fəaliyyət Tarixçəsi (Logs): Bütün daxili CRM əməliyyatlarının dəqiq audit loqları.

5. İnteqrasiyalı Alətlər (Available Integrated Tools):
- 'create_student' & 'create_bulk_students': Tələbələri tək və ya siyahı şəklində birbaşa bazaya yazmaq.
- 'get_financial_stats': Aylıq gəlir, xərc, xalis mənfəət və gözləyən borcları dərhal hesablamaq.
- 'create_teacher' & 'get_teachers': Müəllimləri qeydiyyatdan keçirmək və ya siyahısını gətirmək.
- 'create_group': Yeni tədris qrupu açmaq.
- 'get_students': Tələbələrin reyestrini çıxarmaq.
- 'create_lead': Potensial müştəriləri (lead) qeyd etmək.
- 'send_email': Tələbəyə, valideynə və ya işçiyə bildiriş emaili göndərmək.
- 'execute_sql': Verilənlər bazasında dəqiq PostgreSQL sorğusu icra etmək.

6. Cavab Tərzi (Response Formatting):
- Həmişə səliqəli, strukturlu Markdown formatında (bold **mətnlər**, cədvəllər, siyahılar) cavab ver.
- İstifadəçinin cari rolu: ${userRole}.`
    };

    const finalMessages = [systemMessage, ...messages];

    // Intelligent Intent Detection: Only inject heavy tools schema if user asked for CRM actions
    const lastMsg = messages[messages.length - 1]?.content;
    const rawUserPrompt = typeof lastMsg === 'string' 
      ? lastMsg 
      : Array.isArray(lastMsg) ? lastMsg.map((m: any) => m.text || '').join(' ') : '';
    
    const ACTION_KEYWORDS = [
      'tələbə', 'telebe', 'müəllim', 'muellim', 'qrup', 'borc', 'maliyyə', 'maliye', 
      'gəlir', 'gelir', 'xərc', 'xerc', 'lead', 'müştəri', 'musteri', 'satış', 'satis', 
      'email', 'mail', 'statistika', 'qeyd', 'yarat', 'əlavə', 'elave', 'sil', 'baza',
      'student', 'teacher', 'group', 'debt', 'revenue', 'expense', 'finance', 'create', 'add', 'sql'
    ];
    const isActionRequest = ACTION_KEYWORDS.some(k => rawUserPrompt.toLowerCase().includes(k));

    let response: any;

    async function executeModelInvocation(msgList: any[], isToolPhase: boolean = true) {
      const shouldIncludeTools = isToolPhase && isActionRequest;

      // Helper with strict timeout
      const callWithTimeout = (promise: Promise<any>, timeoutMs: number) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
        ]);
      };

      // 1. Try Primary: openai/gpt-oss-120b (Strict 5.5s Timeout)
      try {
        const res: any = await callWithTimeout(
          nvidiaClient.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: msgList as any,
            tools: shouldIncludeTools ? (tools as any) : undefined,
            temperature: 0.7,
            max_tokens: 1024,
          }),
          5500
        );
        if (res?.choices?.[0]?.message) return res;
      } catch (err: any) {
        console.warn("Primary 120B model delayed or failed (>5.5s), switching to ultra-fast tier:", err.message);
      }

      // 2. Parallel Fast Race between moonshotai/kimi-k3 & meta/llama-3.2-11b-vision (Guaranteed <3s response)
      try {
        const raceKimi = kimiClient.chat.completions.create({
          model: "moonshotai/kimi-k3",
          messages: msgList as any,
          tools: shouldIncludeTools ? (tools as any) : undefined,
          temperature: 0.7,
          max_tokens: 2048,
        });

        const raceLlama = nvidiaClient.chat.completions.create({
          model: "meta/llama-3.2-11b-vision-instruct",
          messages: msgList as any,
          tools: shouldIncludeTools ? (tools as any) : undefined,
          max_tokens: 1536,
        });

        const fastest: any = await Promise.any([raceKimi, raceLlama]);
        if (fastest?.choices?.[0]?.message) return fastest;
      } catch (raceErr) {
        console.warn("Fast race tier issue, calling guaranteed fallback:", raceErr);
      }

      // 3. Guaranteed Immediate Fallback: meta/llama-3.2-11b-vision-instruct
      return await nvidiaClient.chat.completions.create({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: msgList as any,
        tools: shouldIncludeTools ? (tools as any) : undefined,
        max_tokens: 1536,
      });
    }

    try {
      response = await executeModelInvocation(finalMessages, true);
    } catch (error) {
      console.error("All AI model tiers failed:", error);
      throw error;
    }

    let aiMessage = response.choices[0].message;
    const reasoningContent = (aiMessage as any)?.reasoning_content || null;

    // Handle tool execution loop if AI called functions
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      finalMessages.push(aiMessage as any);

      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.type === "function") {
          const fnName = toolCall.function.name;
          let args: any = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            args = {};
          }

          let result: any = { error: "Unknown function" };

          if (fnName === "create_lead") {
            result = await createLead(args);
          } else if (fnName === "get_financial_stats") {
            result = await getFinancialStats();
          } else if (fnName === "create_teacher") {
            result = await createTeacher(args);
          } else if (fnName === "create_student") {
            result = await createStudent(args);
          } else if (fnName === "create_bulk_students") {
            result = await createBulkStudents(args);
          } else if (fnName === "create_group") {
            result = await createGroup(args);
          } else if (fnName === "get_teachers") {
            result = await getTeachers();
          } else if (fnName === "get_students") {
            result = await getStudents();
          } else if (fnName === "execute_sql") {
            result = await executeSql(args);
          } else if (fnName === "send_email") {
            result = await sendEmail(args);
          }

          finalMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: fnName,
            content: JSON.stringify(result)
          } as any);
        }
      }

      // Call AI again using multi-tier fallback
      const secondResponse = await executeModelInvocation(finalMessages, false);
      aiMessage = secondResponse.choices[0].message;
    }

    const assistantContent = aiMessage.content || "";

    // Save assistant response to database
    if (activeSessionId && assistantContent) {
      try {
        await sql`
          INSERT INTO ai_chat_messages (session_id, role, content)
          VALUES (${activeSessionId}, 'assistant', ${assistantContent})
        `;

        await sql`
          UPDATE ai_chat_sessions
          SET updated_at = NOW()
          WHERE id = ${activeSessionId}
        `;
      } catch (e) {
        console.error("Failed to save assistant message:", e);
      }
    }

    return NextResponse.json({ 
      content: assistantContent,
      reasoning: reasoningContent,
      sessionId: activeSessionId
    });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to communicate with AI" }, { status: 500 });
  }
}
