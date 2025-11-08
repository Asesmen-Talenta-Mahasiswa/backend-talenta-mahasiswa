import { timestamp, text, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assessmentSchema } from "../mySchema";
import { randomUUIDv7 } from "bun";
import testSubmission from "./testSubmission";
import test from "./test";

/**
 * Test Submission Result
 *
 * Stores the results/scores for tests within a submission.
 * A single submission (main test) can have MULTIPLE results - one for each sub-test.
 *
 * Relationship Flow:
 * - testSubmissionId → references the main test submission
 * - testId → references which test (main or sub-test) this result is for
 *
 * Example:
 * Student takes "Career Assessment" (main test) submission ID: "abc-123"
 *
 * This creates multiple results:
 * 1. Result { submissionId: "abc-123", testId: 1, result: "aligned_developers" }    ← Main test result
 * 2. Result { submissionId: "abc-123", testId: 2, result: "sangat_sesuai" }         ← Sub-test 1 result
 * 3. Result { submissionId: "abc-123", testId: 3, result: "cukup_siap" }            ← Sub-test 2 result
 * 4. Result { submissionId: "abc-123", testId: 4, result: "praktisi" }              ← Sub-test 3 result
 *
 * All results belong to the same submission, but each represents
 * the outcome of a different test (main or sub-test).
 */
export const testSubmissionResult = assessmentSchema.table(
  "test_submission_result",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    testSubmissionId: uuid("test_submission_id").references(
      () => testSubmission.id,
      {
        onDelete: "set null",
      },
    ),
    testId: integer("test_id").references(() => test.id, {
      onDelete: "set null",
    }),
    result: text("result").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
);

export const testSubmissionResultRelations = relations(
  testSubmissionResult,
  ({ one }) => ({
    // The main test submission this result belongs to
    submission: one(testSubmission, {
      fields: [testSubmissionResult.testSubmissionId],
      references: [testSubmission.id],
    }),
    // Which specific test (main or sub-test) this result is for
    test: one(test, {
      fields: [testSubmissionResult.testId],
      references: [test.id],
    }),
  }),
);

export default testSubmissionResult;
