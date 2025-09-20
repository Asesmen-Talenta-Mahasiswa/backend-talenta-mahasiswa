import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DB_URL, {
  prepare: false,
  ssl:
    process.env.NODE_ENV === "production" ? { ca: process.env.DB_CERT } : false,
});
const db = drizzle({
  client,
  casing: "snake_case",
  schema,
});

export default db;
