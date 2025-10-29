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
import { t } from "elysia";
import { _ } from "@faker-js/faker/dist/airline-DF6RqYmq";
import { SubmissionStatus } from "../../common/enum";

export const testSubmissionSchema = createSelectSchema(testSubmissionsTable);
const _newTestSubmissionSchema = createInsertSchema(testSubmissionsTable, {
  studentId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Student id harus beruapa uuid",
      examples: ["019a264c-18a9-7162-afe7-f3a7d7a1d3d7"],
    }),
  testId: (schema) =>
    t.Number({
      ...schema,
      minimum: 1,
      error: "Test id harus berupa angka",
      examples: [1],
    }),
  status: t.Optional(
    t.Enum(SubmissionStatus, {
      error: "Nilai status hanya boleh berupa completed atau in_progress",
      examples: ["completed", "in_progress"],
    })
  ),
});
export const newTestSubmissionSchema = t.Omit(_newTestSubmissionSchema, [
  "id",
  "createdAt",
  "completedAt",
]);
const _updateTestSubmissionSchema = createUpdateSchema(testSubmissionsTable, {
  studentId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Student id harus beruapa uuid",
      examples: ["019a264c-18a9-7162-afe7-f3a7d7a1d3d7"],
    }),
  testId: (schema) =>
    t.Number({
      ...schema,
      minimum: 1,
      error: "Test id harus berupa angka",
      examples: [1],
    }),
  status: t.Optional(
    t.Enum(SubmissionStatus, {
      error: "Nilai status hanya boleh berupa completed atau in_progress",
      examples: ["completed", "in_progress"],
    })
  ),
  completedAt: (schema) =>
    t.String({
      ...schema,
      format: "date",
      error: "Completed at harus berupa Date",
      examples: [Date.now()],
    }),
});
export const updateTestSubmissionSchema = t.Omit(_updateTestSubmissionSchema, [
  "id",
  "createdAt",
  "studentId",
  "testId",
]);

export const studentAnswerSchema = createSelectSchema(studentAnswersTable);
const _newStudentAnswerSchema = createInsertSchema(studentAnswersTable, {
  submissionId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Submission id harus berupa uuid",
      examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
    }),
  questionId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Question id harus berupa uuid",
      examples: ["019a2689-eaf9-7dce-936c-191f988d195c"],
    }),
  selectedOptionId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Selected option id harus berupa uuid",
      examples: ["019a2689-fd2f-7bf3-8733-8883b8f9f6c7"],
    }),
});
export const newStudentAnswerSchema = t.Omit(_newStudentAnswerSchema, [
  "id",
  "createdAt",
]);
const _updateStudentAnswerSchema = createUpdateSchema(studentAnswersTable, {
  submissionId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Submission id harus berupa uuid",
      examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
    }),
  questionId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Question id harus berupa uuid",
      examples: ["019a2689-eaf9-7dce-936c-191f988d195c"],
    }),
  selectedOptionId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Selected option id harus berupa uuid",
      examples: ["019a2689-fd2f-7bf3-8733-8883b8f9f6c7"],
    }),
});
export const updateStudentAnswerSchema = t.Omit(_updateStudentAnswerSchema, [
  "id",
  "createdAt",
  "submissionId",
  "questionId",
]);

export const submissionResultSchema = createSelectSchema(submissionResultsTable);
const _newSubmissionResultSchema = createInsertSchema(submissionResultsTable, {
  testId: (schema) =>
    t.Number({
      ...schema,
      minimum: 1,
      error: "Test id harus berupa angka",
      examples: [1],
    }),
  submissionId: (schema) =>
    t.String({
      ...schema,
      format: "uuid",
      error: "Submission id harus berupa uuid",
      examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
    }),
  resultValue: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Nilai submission tidak boleh kosong",
      examples: ["cukup_sesuai"],
    }),
});
export const newSubmissionResultSchema = t.Omit(_newSubmissionResultSchema, [
  "id",
  "createdAt",
]);

export const testSubmissionParamsSchema = t.Object({
  submissionId: t.String({
    format: "uuid",
    error: "Submission id harus berupa uuid",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
});

export const studentAnswerParamsSchema = t.Object({
  answerId: t.String({
    format: "uuid",
    error: "Answer id harus berupa uuid",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
});

export type TestSubmissionModel = typeof testSubmissionSchema.static;
export type NewTestSubmissionModel = typeof newTestSubmissionSchema.static;
export type UpdateTestSubmissionModel = typeof updateTestSubmissionSchema.static;

export type StudentAnswerModel = typeof studentAnswerSchema.static;
export type NewStudentAnswerModel = typeof newStudentAnswerSchema.static;
export type UpdateStudentAnswerModel = typeof updateStudentAnswerSchema.static;

export type SubmissionResultModel = typeof submissionResultSchema.static;
export type NewSubmissionResultModel = typeof newSubmissionResultSchema.static;
