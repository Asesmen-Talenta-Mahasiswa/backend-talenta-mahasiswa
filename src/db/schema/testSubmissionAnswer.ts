import { timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assessmentSchema } from "../mySchema";
import { randomUUIDv7 } from "bun";
import testSubmission from "./testSubmission";
import testQuestion from "./testQuestion";
import testQuestionOption from "./testQuestionOption";

/**
 * Test Submission Answer
 *
 * Stores student answers for questions in a test submission.
 *
 * Relationship Flow:
 * - testSubmissionId → references the main test submission
 * - testQuestionId → references the question being answered
 * - The question itself (testQuestion) has testId, which tells us
 *   whether the answer is for the main test or a specific sub-test
 *
 * Example:
 * Student takes "Career Assessment" (main test) which contains:
 * - Sub-test: "Personality Test" (has questions 1-50)
 * - Sub-test: "IQ Test" (has questions 51-100)
 *
 * All answers reference the same submission (main test),
 * but through testQuestionId we can determine which sub-test
 * each answer belongs to.
 */
export const testSubmissionAnswer = assessmentSchema.table(
  "test_submission_answer",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    testSubmissionId: uuid("test_submission_id")
      .notNull()
      .references(() => testSubmission.id, { onDelete: "cascade" }),
    testQuestionId: uuid("test_question_id")
      .notNull()
      .references(() => testQuestion.id, { onDelete: "cascade" }),
    selectedOptionId: uuid("selected_option_id")
      .notNull()
      .references(() => testQuestionOption.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
);

export const testSubmissionAnswerRelations = relations(
  testSubmissionAnswer,
  ({ one }) => ({
    submission: one(testSubmission, {
      fields: [testSubmissionAnswer.testSubmissionId],
      references: [testSubmission.id],
    }),
    question: one(testQuestion, {
      fields: [testSubmissionAnswer.testQuestionId],
      references: [testQuestion.id],
    }),
    selectedOption: one(testQuestionOption, {
      fields: [testSubmissionAnswer.selectedOptionId],
      references: [testQuestionOption.id],
    }),
  }),
);

export default testSubmissionAnswer;
