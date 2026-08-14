import postgres from "postgres";

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const sql = postgres(connectionUrl, {
  ssl: "require",
  prepare: false, // Required for Supabase pgbouncer transaction pooling
});

export default sql;

