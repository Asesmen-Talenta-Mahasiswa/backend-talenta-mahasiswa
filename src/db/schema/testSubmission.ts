import { timestamp, uuid, integer, text, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { assessmentSchema } from "../mySchema";
import { randomUUIDv7 } from "bun";
import students from "./student";
import test from "./test";
import testSubmissionAnswer from "./testSubmissionAnswer";
import testSubmissionResult from "./testSubmissionResult";

export const testSubmission = assessmentSchema.table("test_submission", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUIDv7()),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  testId: integer("test_id")
    .notNull()
    .references(() => test.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: "string" }),
});

export const testSubmissionRelations = relations(
  testSubmission,
  ({ one, many }) => ({
    student: one(students, {
      fields: [testSubmission.studentId],
      references: [students.id],
    }),
    test: one(test, {
      fields: [testSubmission.testId],
      references: [test.id],
    }),
    answers: many(testSubmissionAnswer),
    results: many(testSubmissionResult),
  }),
);

export default testSubmission;
