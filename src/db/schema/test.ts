import {
  boolean,
  foreignKey,
  index,
  integer,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { assessmentSchema } from "../mySchema";
import testInstruction from "./testInstruction";
import testNote from "./testNote";
import testQuestion from "./testQuestion";
import testSubmission from "./testSubmission";

/**
 * Test
 *
 * Represents assessments in a hierarchical structure.
 *
 * Structure:
 * - Main Test: parentId = NULL (top-level test)
 * - Sub-test: parentId = [main test id] (nested under main test)
 *
 * Example Hierarchy:
 * "Career Assessment" (id: 1, parentId: NULL)          ← Main Test
 *   ├── "Personality Test" (id: 2, parentId: 1)        ← Sub-test
 *   ├── "IQ Test" (id: 3, parentId: 1)                 ← Sub-test
 *   └── "Interest Inventory" (id: 4, parentId: 1)      ← Sub-test
 *
 * Submission Rules:
 * - Students create submissions ONLY for main tests (parentId IS NULL)
 * - Sub-tests do NOT have their own submissions
 * - Questions can belong to either main tests or sub-tests
 * - Results are generated per test (one result per main test + one per sub-test)
 */
const test = assessmentSchema.table(
  "test",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (column) => [
    // Self-referencing key. NULL parentId = top-level test.
    foreignKey({
      columns: [column.parentId],
      foreignColumns: [column.id],
    }).onDelete("cascade"),

    // search test name
    index("test_name_gin_idx").using("gin", column.name.op("gin_trgm_ops")),
  ],
);

export default test;

export const testRelations = relations(test, ({ one, many }) => ({
  // Parent test relationship (for sub-tests only)
  parent: one(test, {
    fields: [test.parentId],
    references: [test.id],
    relationName: "test_hierarchy",
  }),
  // Child tests (sub-tests under this main test)
  children: many(test, { relationName: "test_hierarchy" }),
  // Instructions for this test
  instructions: many(testInstruction),
  // Notes for this test
  notes: many(testNote),
  // Questions belonging to this test (can be in main test or sub-test)
  questions: many(testQuestion),
  // Submissions (only for main tests with parentId = NULL)
  submissions: many(testSubmission),
}));
