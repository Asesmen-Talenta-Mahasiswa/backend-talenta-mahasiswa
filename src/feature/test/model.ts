import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import {
  optionsTable,
  questionsTable,
  testInstructionsTable,
  testNotesTable,
  testsTable,
} from "../../db/schema";
import { t } from "elysia";

export const testSchema = createSelectSchema(testsTable);
export const newTestSchema = createInsertSchema(testsTable);
export const updateTestSchema = createUpdateSchema(testsTable);

export const testInstructionSchema = createSelectSchema(testInstructionsTable);
export const newTestInstructionSchema = createInsertSchema(testInstructionsTable);
export const updateTestInstructionSchema = createUpdateSchema(testInstructionsTable);

export const testNoteSchema = createSelectSchema(testNotesTable);
export const newTestNoteSchema = createInsertSchema(testNotesTable);
export const updateTestNoteSchema = createUpdateSchema(testNotesTable);

export const questionSchema = createSelectSchema(questionsTable);
export const newQuestionSchema = createInsertSchema(questionsTable);
export const updateQuestionSchema = createUpdateSchema(questionsTable);

export const optionSchema = createSelectSchema(optionsTable);
export const newOptionSchema = createInsertSchema(optionsTable);
export const updateOptionSchema = createUpdateSchema(optionsTable);

export const testParamsSchema = t.Object({
  testId: t.Numeric({ error: "Test id harus berupa numeric", examples: [1] }),
});

export type TestModel = typeof testSchema.static;
export type NewTestModel = typeof newTestSchema.static;
export type UpdateTestModel = typeof updateTestSchema.static;

export type TestInstructionModel = typeof testInstructionSchema.static;
export type NewTestInstructionModel = typeof newTestInstructionSchema.static;
export type UpdateTestInstructionModel = typeof updateTestInstructionSchema.static;

export type TestNoteModel = typeof testNoteSchema.static;
export type NewTestNoteModel = typeof newTestNoteSchema.static;
export type UpdateTestNoteModel = typeof updateTestNoteSchema.static;

export type QuestionModel = typeof questionSchema.static;
export type NewQuestionModel = typeof newQuestionSchema.static;
export type UpdateQuestionModel = typeof updateQuestionSchema.static;

export type OptionModel = typeof optionSchema.static;
export type NewOptionModel = typeof newOptionSchema.static;
export type UpdateOptionModel = typeof updateOptionSchema.static;
