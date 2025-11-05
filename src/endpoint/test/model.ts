import { t } from "elysia";
import { dbModel } from "../../db/model";
import { SortDirection } from "../../common/constant";

const insertTest = (({ id, createdAt, ...rest }) => rest)(dbModel.insert.test);
const insertTestInstruction = (({ id, testId, ...rest }) => rest)(
  dbModel.insert.testInstruction,
);
const insertTestNote = (({ id, testId, ...rest }) => rest)(
  dbModel.insert.testNote,
);
const insertTestQuestion = (({ id, testId, ...rest }) => rest)(
  dbModel.insert.testQuestion,
);
const insertTestQuestionOption = (({ id, testQuestionId, ...rest }) => rest)(
  dbModel.insert.testQuestionOption,
);
const insertTestSubmission = (({ id, createdAt, ...rest }) => rest)(
  dbModel.insert.testSubmission,
);
const insertTestSubmissionAnswer = (({ id, createdAt, ...rest }) => rest)(
  dbModel.insert.testSubmissionAnswer,
);
const insertTestSubmissionResult = (({ id, createdAt, ...rest }) => rest)(
  dbModel.insert.testSubmissionResult,
);

const selectTest = dbModel.select.test;
const selectTestInstruction = dbModel.select.testInstruction;
const selectTestNote = dbModel.select.testNote;
const selectTestQuestion = dbModel.select.testQuestion;
const selectTestQuestionOption = dbModel.select.testQuestionOption;
const selectTestSubmission = dbModel.select.testSubmission;
const selectTestSubmissionAnswer = dbModel.select.testSubmissionAnswer;
const selectTestSubmissionResult = dbModel.select.testSubmissionResult;

export const testModel = t.Object(
  {
    ...selectTest,
  },
  {},
);
export const newTestModel = t.Object(
  {
    ...insertTest,
  },
  {
    error: "Request body untuk tes baru tidak valid",
  },
);
export const updateTestModel = t.Partial(
  t.Object(
    {
      ...insertTest,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah tes tidak valid",
    },
  ),
);

export const testInstructionModel = t.Object(
  {
    ...selectTestInstruction,
  },
  {},
);

export const newTestInstructionModel = t.Object(
  {
    ...insertTestInstruction,
  },
  {
    error: "Request body untuk instruksi tes baru tidak valid",
  },
);

export const updateTestInstructionModel = t.Partial(
  t.Object(
    {
      id: dbModel.insert.testInstruction.id,
      ...insertTestInstruction,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah instruksi tes tidak valid",
    },
  ),
);

export const testNoteModel = t.Object(
  {
    ...selectTestNote,
  },
  {},
);

export const newTestNoteModel = t.Object(
  {
    ...insertTestNote,
  },
  {
    error: "Request body untuk catatan tes baru tidak valid",
  },
);

export const updateTestNoteModel = t.Partial(
  t.Object(
    {
      id: dbModel.insert.testNote.id,
      ...insertTestNote,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah catatan tes tidak valid",
    },
  ),
);

export const testQuestionModel = t.Object(
  {
    ...selectTestQuestion,
  },
  {},
);

export const newTestQuestionModel = t.Object(
  {
    ...insertTestQuestion,
  },
  {
    error: "Request body untuk pertanyaan tes baru tidak valid",
  },
);

export const updateTestQuestionModel = t.Partial(
  t.Object(
    {
      id: dbModel.insert.testQuestion.id,
      ...insertTestQuestion,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah pertanyaan tes tidak valid",
    },
  ),
);

export const testQuestionOptionModel = t.Object(
  {
    ...selectTestQuestionOption,
  },
  {},
);

export const newTestQuestionOptionModel = t.Object(
  {
    ...insertTestQuestionOption,
  },
  {
    error: "Request body untuk opsi pertanyaan baru tidak valid",
  },
);

export const updateTestQuestionOptionModel = t.Partial(
  t.Object(
    {
      id: dbModel.insert.testQuestionOption.id,
      ...insertTestQuestionOption,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah opsi pertanyaan tidak valid",
    },
  ),
);

export const testSubmissionModel = t.Object(
  {
    ...selectTestSubmission,
  },
  {},
);

export const newTestSubmissionModel = t.Object(
  {
    ...insertTestSubmission,
  },
  {
    error: "Request body untuk pengumpulan tes baru tidak valid",
  },
);

export const updateTestSubmissionModel = t.Partial(
  t.Object(
    {
      ...insertTestSubmission,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah pengumpulan tes tidak valid",
    },
  ),
);

export const testSubmissionAnswerModel = t.Object(
  {
    ...selectTestSubmissionAnswer,
  },
  {},
);

export const newTestSubmissionAnswerModel = t.Object(
  {
    ...insertTestSubmissionAnswer,
  },
  {
    error: "Request body untuk jawaban pengumpulan tes baru tidak valid",
  },
);

export const updateTestSubmissionAnswerModel = t.Array(
  t.Partial(
    t.Object(
      {
        id: dbModel.insert.testSubmissionAnswer.id,
        testQuestionId: insertTestSubmissionAnswer.testQuestionId,
        selectedOptionId: insertTestSubmissionAnswer.selectedOptionId,
      },
      {
        minProperties: 1,
        error:
          "Request body untuk mengubah jawaban pengumpulan tes tidak valid",
      },
    ),
  ),
  {
    error: "Request body untuk mengubah jawaban pengumpulan tes tidak valid",
  },
);

export const testSubmissionResultModel = t.Object(
  {
    ...selectTestSubmissionResult,
  },
  {},
);

export const newTestSubmissionResultModel = t.Object(
  {
    ...insertTestSubmissionResult,
  },
  {
    error: "Request body untuk hasil pengumpulan tes baru tidak valid",
  },
);

export const updateTestSubmissionResultModel = t.Partial(
  t.Object(
    {
      ...insertTestSubmissionResult,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah hasil pengumpulan tes tidak valid",
    },
  ),
);

export type TestModel = typeof testModel.static;
export type NewTestModel = typeof newTestModel.static;
export type UpdateTestModel = typeof updateTestModel.static;

export type TestInstructionModel = typeof testInstructionModel.static;
export type NewTestInstructionModel = typeof newTestInstructionModel.static;
export type UpdateTestInstructionModel =
  typeof updateTestInstructionModel.static;

export type TestNoteModel = typeof testNoteModel.static;
export type NewTestNoteModel = typeof newTestNoteModel.static;
export type UpdateTestNoteModel = typeof updateTestNoteModel.static;

export type TestQuestionModel = typeof testQuestionModel.static;
export type NewTestQuestionModel = typeof newTestQuestionModel.static;
export type UpdateTestQuestionModel = typeof updateTestQuestionModel.static;

export type TestQuestionOptionModel = typeof testQuestionOptionModel.static;
export type NewTestQuestionOptionModel =
  typeof newTestQuestionOptionModel.static;
export type UpdateTestQuestionOptionModel =
  typeof updateTestQuestionOptionModel.static;

export type TestSubmissionModel = typeof testSubmissionModel.static;
export type NewTestSubmissionModel = typeof newTestSubmissionModel.static;
export type UpdateTestSubmissionModel = typeof updateTestSubmissionModel.static;

export type TestSubmissionAnswerModel = typeof testSubmissionAnswerModel.static;
export type NewTestSubmissionAnswerModel =
  typeof newTestSubmissionAnswerModel.static;
export type UpdateTestSubmissionAnswerModel =
  typeof updateTestSubmissionAnswerModel.static;

export type TestSubmissionResultModel = typeof testSubmissionResultModel.static;
export type NewTestSubmissionResultModel =
  typeof newTestSubmissionResultModel.static;
export type UpdateTestSubmissionResultModel =
  typeof updateTestSubmissionResultModel.static;

export const testQueryModel = t.Object({
  page: t.Optional(
    t.Number({
      minimum: 1,
      error: "Halaman tes harus berupa angka dan tidak boleh negatif atau nol",
    }),
  ),
  pageSize: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      error:
        "Ukuran halaman tes harus berupa angka dan bernilai antara 1 - 100",
      examples: [1, 5, 10, 50, 100],
    }),
  ),
  search: t.Optional(
    t.String({
      error: "Pencarian tes harus berupa text",
      examples: ["Tes Talenta Mahasiswa", "Tes Kepribadian Ganda"],
    }),
  ),
  showSubTest: t.Optional(
    t.Boolean({
      error: "Flag untuk melihat sub tes hanya boleh bernilai benar atau salah",
      examples: [true, false],
    }),
  ),
  sortDirection: t.Optional(
    t.Enum(SortDirection, {
      error: "Opsi pengurutan tes hanya bisa ascending atau descending",
      examples: [SortDirection.DESC, SortDirection.ASC],
    }),
  ),
});

export const testParamsModel = t.Object({
  testId: t.Number({
    minimum: 1,
    error: "ID tes harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
});

export const testBodyModel = t.Object({
  ...testModel.properties,
  instructions: t.Array(testInstructionModel),
  notes: t.Array(testNoteModel),
  questions: t.Array(
    t.Object({
      ...testQuestionModel.properties,
      options: t.Array(testQuestionOptionModel),
    }),
  ),
  children: t.Array(testModel),
});

export const newTestBodyModel = t.Object(
  {
    ...newTestModel.properties,
    instructions: t.Array(newTestInstructionModel),
    notes: t.Array(newTestNoteModel),
    questions: t.Array(
      t.Object({
        ...newTestQuestionModel.properties,
        options: t.Array(newTestQuestionOptionModel),
      }),
    ),
  },
  {
    error: "Request body untuk tes baru tidak valid",
  },
);

export const updateTestBodyModel = t.Object(
  {
    ...updateTestModel.properties,
    instructions: t.Array(updateTestInstructionModel),
    notes: t.Array(updateTestNoteModel),
    questions: t.Array(
      t.Object({
        ...updateTestQuestionModel.properties,
        options: t.Array(updateTestQuestionOptionModel),
      }),
    ),
  },
  {
    error: "Request body untuk tes baru tidak valid",
  },
);

export type NewTestBodyModel = typeof newTestBodyModel.static;
export type UpdateTestBodyModel = typeof updateTestBodyModel.static;
