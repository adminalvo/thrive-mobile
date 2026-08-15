export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow longer execution times for LLM + tool execution
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import sql from "@/lib/db";
import bcrypt from "bcrypt";

const geminiClient = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || "missing-key-during-build"
});

const fallbackClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "missing-key"
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
          parent_phone: { type: "string", description: "Valideyn telefon nömrəsi" }
        },
        required: ["first_name", "last_name"]
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
  }
];

// Tool Executors
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
    const invoices = await sql`SELECT amount, status FROM invoices`;
    const payments = await sql`SELECT SUM(amount) as total_paid FROM payments`;
    
    const totalPaid = Number(payments[0]?.total_paid) || 0;
    
    let totalExpected = 0;
    invoices.forEach((inv: any) => {
      totalExpected += Number(inv.amount) || 0;
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
        INSERT INTO students (id, profile_id)
        VALUES (${studentId}, ${profileId})
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
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemMessage = {
      role: "system",
      content: "Sən Thrive CRM-in ağıllı və rəsmi köməkçisisən. Sən istifadəçinin yazdığı dilə uyğun olaraq Azərbaycan, Rus və ya İngilis dillərində səlis və mehriban cavab verirsən. Sən funksiyalardan istifadə edərək sistemdən məlumat ala və məlumat yarada bilərsən (müəllimlər, tələbələr, qruplar, lead-lər və maliyyə statistikası). Şəkillər göndərildikdə onların məzmununu analiz edə bilərsən."
    };

    const finalMessages = [systemMessage, ...messages];

    let usedFallback = false;
    let response: any;

    // Try Primary LLM (Gemini via OpenAI SDK) with Fallback to OpenRouter (openai/gpt-4o)
    try {
      response = await geminiClient.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: finalMessages as any,
        tools: tools as any,
        max_tokens: 1024,
      });
    } catch (primaryError) {
      console.warn("Primary AI API call failed, falling back to OpenRouter GPT-4o:", primaryError);
      usedFallback = true;
      response = await fallbackClient.chat.completions.create({
        model: "openai/gpt-4o",
        messages: finalMessages as any,
        tools: tools as any,
        max_tokens: 1024,
      });
    }

    let aiMessage = response.choices[0].message;

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
          } else if (fnName === "create_group") {
            result = await createGroup(args);
          } else if (fnName === "get_teachers") {
            result = await getTeachers();
          } else if (fnName === "get_students") {
            result = await getStudents();
          }

          finalMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: fnName,
            content: JSON.stringify(result)
          } as any);
        }
      }

      // Call AI again with same client
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
