import sql from "@/lib/db";

export async function logAction(
  action: string,
  details: Record<string, any>,
  userId?: string | null
) {
  try {
    await sql`
      INSERT INTO system_logs (user_id, action, details, created_at)
      VALUES (${userId || null}, ${action}, ${sql.json(details)}, NOW())
    `;
  } catch (error) {
    console.error("Failed to log action:", error);
    // Non-blocking
  }
}
