import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DB_URL, { prepare: false });
const db = drizzle({
  client,
  connection: {
    ssl: process.env.NODE_ENV === "production" ? true : false,
  },
  casing: "snake_case",
  schema,
});

export default db;
