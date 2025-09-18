import {
  pgTable,
  uuid,
  char,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Define the permission level enum
export const permissionLevelEnum = pgEnum("permission_level", [
  "student",
  "program",
  "department",
  "faculty",
  "university",
  "admin",
]);

// User table schema
// This table merge all user roles into a single table with a permission level field
// The permission levels are:
// - student: regular student user
// - program: program head
// - department: department head
// - faculty: faculty head
// - university: university admin
// - admin: system admin
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  npm: char("npm", { length: 10 }).notNull().unique(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  password: varchar("password", { length: 32 }).notNull(),
  program: varchar("program").notNull(),
  department: varchar("department").notNull(),
  faculty: varchar("faculty").notNull(),
  permissionLevel: permissionLevelEnum("permission_level")
    .notNull()
    .default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export type inference for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
