import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres({
  prepare: false,
  host: Bun.env.DB_HOST,
  port: parseInt(Bun.env.DB_PORT),
  user: Bun.env.DB_USER,
  password: Bun.env.DB_PASSWORD,
  database: Bun.env.DB_NAME,
  // refer to https://github.com/porsager/postgres#ssl for more info on SSL
  ssl: Bun.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const db = drizzle({
  client,
  casing: "snake_case",
  schema,
});

export default db;
