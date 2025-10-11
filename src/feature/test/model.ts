import { createInsertSchema } from "drizzle-typebox";
import {
  optionsTable,
  questionsTable,
  subtestInstructionsTable,
  subtestNotesTable,
  subTestsTable,
  testsTable,
} from "../../db/schema";

export const newTestSchema = createInsertSchema(testsTable);
export const newSubTestSchema = createInsertSchema(subTestsTable);
export const newSubTestInstructionSchema = createInsertSchema(
  subtestInstructionsTable
);
export const newSubTestNoteSchema = createInsertSchema(subtestNotesTable);
export const newQuestionSchema = createInsertSchema(questionsTable);
export const newOptionSchema = createInsertSchema(optionsTable);

export type NewTestModel = typeof newTestSchema.static;
export type NewSubTestModel = typeof newSubTestSchema.static;
export type NewSubTestInstructionModel =
  typeof newSubTestInstructionSchema.static;
export type NewSubTestNoteModel = typeof newSubTestNoteSchema.static;
export type NewQuestionModel = typeof newQuestionSchema.static;
export type NewOptionModel = typeof newOptionSchema.static;
