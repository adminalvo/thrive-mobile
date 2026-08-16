import postgres from "postgres";

// Use DATABASE_URL for runtime queries as it connects to PgBouncer (connection pooler)
// This is critical for Vercel Serverless performance.
const connectionUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DIRECT_URL;

const sql = connectionUrl 
  ? postgres(connectionUrl, {
      ssl: "require",
      prepare: false,
    }) 
  : (new Proxy(() => {}, {
      apply: () => { throw new Error("DATABASE_URL is not set in Vercel Environment Variables"); }
    }) as any);

export default sql;

