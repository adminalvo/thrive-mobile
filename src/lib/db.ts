import postgres from "postgres";

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

const sql = connectionUrl 
  ? postgres(connectionUrl, {
      ssl: "require",
      prepare: false,
    }) 
  : (new Proxy(() => {}, {
      apply: () => { throw new Error("DATABASE_URL is not set in Vercel Environment Variables"); }
    }) as any);

export default sql;

