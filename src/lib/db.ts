import postgres from "postgres";

// Use DATABASE_URL / POSTGRES_URL for runtime queries as it connects to connection pooler
const connectionUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DIRECT_URL;

declare global {
  // eslint-disable-next-line no-var
  var __postgres_sql__: ReturnType<typeof postgres> | undefined;
}

let sqlInstance: ReturnType<typeof postgres>;

if (connectionUrl) {
  if (!globalThis.__postgres_sql__) {
    globalThis.__postgres_sql__ = postgres(connectionUrl, {
      ssl: "require",
      prepare: false,
      max: 15,
      idle_timeout: 60,
      connect_timeout: 10,
    });
  }
  sqlInstance = globalThis.__postgres_sql__;
} else {
  sqlInstance = (new Proxy(() => {}, {
    apply: () => { throw new Error("DATABASE_URL is not set in Vercel Environment Variables"); }
  }) as any);
}

const sql = sqlInstance;
export default sql;
