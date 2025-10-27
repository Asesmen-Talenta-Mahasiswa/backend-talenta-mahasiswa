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
export const newTestSchema = createInsertSchema(testsTable, {
  name: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Nama tidak boleh kosong",
      examples: ["Tes Akhir Semester", "Quiz Pemrograman"],
    }),
  description: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      error: "Deskripsi tidak valid",
      examples: [
        "Tes Asesmen Talenta Mahasiswa merupakan alat ukur yang dirancang untuk membantu mahasiswa mengenali potensi, kepribadian, serta arah pengembangan diri dan karier mereka. Melalui asesmen ini, mahasiswa akan memperoleh gambaran yang lebih komprehensif mengenai minat, karakteristik personal, dan pola perilaku yang memengaruhi cara mereka belajar, berinteraksi, serta mengambil keputusan dalam kehidupan akademik maupun profesional.",
        "Asesmen pada bagian ini akan membantumu untuk mengetahui kecenderungan bidang karir yang ideal untuk kamu tekuni kelak, berdasarkan minat serta karakteristik diri. Terdapat 40 soal yang terbagi menjadi dua sub bagian. Cermati instruksi pada setiap sub. bagiannya ya. Selamat Mengerjakan!",
      ],
    }),
});
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

export const testQuerySchema = t.Object({
  page: t.Optional(
    t.Number({ minimum: 1, error: "Halaman minimal 1", examples: [1, 2, 3] })
  ),
  pageSize: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      error: "Ukuran halaman harus antara 1-100",
      examples: [1, 5, 10, 20, 50, 100],
    })
  ),
  search: t.Optional(
    t.String({
      error: "Pencarian tidak valid, harus berupa NPM atau nama",
      examples: ["Tes Talenta Mahasiswa", "Tes Kepribadian Ganda"],
    })
  ),
  showSubTest: t.Optional(
    t.Boolean({
      error: "Nilai show sub test hanya boleh true atau false",
      examples: [true, false],
    })
  ),
  sort: t.Optional(
    t.UnionEnum(["asc", "desc"], {
      error: "Opsi sorting tidak valid",
      examples: ["asc", "desc"],
    })
  ),
});

export const testParamsSchema = t.Object({
  testId: t.Numeric({ error: "Id harus berupa numeric", examples: [1] }),
});

export const questionParamsSchema = t.Object({
  questionid: t.Numeric({ error: "Id harus berupa numeric", examples: [1] }),
});

export const newTestBodySchema = t.Object({
  ...t.Omit(newTestSchema, ["id"]).properties,
  instructions: t.Optional(t.Array(t.Omit(newTestInstructionSchema, ["id", "testId"]))),
  notes: t.Optional(t.Array(t.Omit(newTestNoteSchema, ["id", "testId"]))),
  questions: t.Optional(
    t.Array(
      t.Object({
        ...t.Omit(newQuestionSchema, ["id", "testId"]).properties,
        options: t.Array(t.Omit(newOptionSchema, ["id", "questionId"])),
      })
    )
  ),
});

export type NewTestBodyModel = typeof newTestBodySchema.static;

// PUT body schema: allow partial top-level fields, and reconcile nested collections.
// Items can be existing (with id) or new (without id), and missing ones will be deleted.
const updateInstructionItem = t.Union([
  updateTestInstructionSchema,
  t.Omit(newTestInstructionSchema, ["id", "testId"]),
]);
const updateNoteItem = t.Union([
  updateTestNoteSchema,
  t.Omit(newTestNoteSchema, ["id", "testId"]),
]);
const updateOptionItem = t.Union([
  updateOptionSchema,
  t.Omit(newOptionSchema, ["id", "questionId"]),
]);
const updateQuestionItem = t.Union([
  // Update existing question (options optional)
  t.Object({
    ...updateQuestionSchema.properties,
    options: t.Optional(t.Array(updateOptionItem)),
  }),
  // Create new question (must include options)
  t.Object({
    ...t.Omit(newQuestionSchema, ["id", "testId"]).properties,
    options: t.Array(updateOptionItem),
  }),
]);

export const updateTestBodySchema = t.Object({
  ...t.Omit(updateTestSchema, ["id"]).properties,
  instructions: t.Optional(t.Array(updateInstructionItem)),
  notes: t.Optional(t.Array(updateNoteItem)),
  questions: t.Optional(t.Array(updateQuestionItem)),
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
export type UpdateTestBodyModel = typeof updateTestBodySchema.static;
