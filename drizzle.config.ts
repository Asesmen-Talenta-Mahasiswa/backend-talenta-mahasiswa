import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_URL,
  },
  // extensionsFilters: ["pg_trgm"], // bugged
  verbose: true,
  strict: true,
});
