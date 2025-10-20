import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import {
  studentAnswersTable,
  submissionResultsTable,
  testSubmissionsTable,
} from "../../db/schema";

export const testSubmissionSchema = createSelectSchema(testSubmissionsTable);
export const newTestSubmissionSchema = createInsertSchema(testSubmissionsTable);
export const updateTestSubmissionSchema = createUpdateSchema(testSubmissionsTable);

export const studentAnswerSchema = createSelectSchema(studentAnswersTable);
export const newStudentAnswerSchema = createInsertSchema(studentAnswersTable);
export const updateStudentAnswerSchema = createInsertSchema(studentAnswersTable);

export const submissionResultSchema = createSelectSchema(submissionResultsTable);
export const newSubmissionResultSchema = createInsertSchema(submissionResultsTable);
export const updateSubmissionResultSchema = createUpdateSchema(submissionResultsTable);

export type TestSubmissionModel = typeof testSubmissionSchema.static;
export type NewTestSubmissionModel = typeof newTestSubmissionSchema.static;
export type UpdateTestSubmissionModel = typeof updateTestSubmissionSchema.static;

export type StudentAnswerModel = typeof studentAnswerSchema.static;
export type NewStudentAnswerModel = typeof newStudentAnswerSchema.static;
export type UpdateStudentAnswerModel = typeof updateStudentAnswerSchema.static;

export type SubmissionResultModel = typeof submissionResultSchema.static;
export type NewSubmissionResultModel = typeof newSubmissionResultSchema.static;
export type UpdateSubmissionResultModel = typeof updateSubmissionResultSchema.static;
