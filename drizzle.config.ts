import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: Bun.env.DB_HOST,
    port: parseInt(Bun.env.DB_PORT),
    user: Bun.env.DB_USER,
    password: Bun.env.DB_PASSWORD,
    database: Bun.env.DB_NAME,
    // certification for SSL connection, get it from supabase dashboard
    ssl: Bun.env.NODE_ENV === "production" ? { ca: Bun.env.DB_CERT } : false,
  },
  casing: "snake_case",
});
