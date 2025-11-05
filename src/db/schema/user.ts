import { randomUUIDv7 } from "bun";
import { uuid, text, timestamp } from "drizzle-orm/pg-core";
import { assessmentSchema } from "../mySchema";
import { sql } from "drizzle-orm";

const user = assessmentSchema.table("user", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUIDv7()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // hashed password
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .notNull()
    .$onUpdate(() => sql`now()`),
});

export default user;
