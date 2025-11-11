import { t } from "elysia";
import { createInsertSchema } from ".";
import {
  TestQuestionType,
  TestSubmissionStatus,
  UserRole,
} from "../common/constant";
import { spreads } from "../utils";
import * as schema from "./schema";

const department = createInsertSchema(schema.department, {
  name: t.String({
    minLength: 1,
    error: "Nama jurusan harus berupa text dan tidak boleh kosong",
    examples: ["Teknik Elektro"],
  }),
});
const faculty = createInsertSchema(schema.faculty, {
  name: t.String({
    minLength: 1,
    error: "Nama fakultas harus berupa text dan tidak boleh kosong",
    examples: ["FT"],
  }),
});
const major = createInsertSchema(schema.major, {
  name: t.String({
    minLength: 1,
    error: "Nama jurusan harus berupa text dan tidak boleh kosong",
    examples: ["Teknik Informatika"],
  }),
});
const student = createInsertSchema(schema.student, {
  npm: t.String({
    minLength: 10,
    maxLength: 10,
    pattern: "^[0-9]+$",
    error: "NPM harus terdiri dari 10 angka numeric",
    examples: ["2215061066"],
  }),
  name: t.String({
    minLength: 1,
    error: "Nama mahasiswa harus berupa text dan tidak boleh kosong",
    examples: ["Budi Santoso"],
  }),
  email: t.Optional(
    t.Union(
      [
        t.String({
          format: "email",
          error: "Format email tidak valid",
          examples: ["budi@example.com"],
        }),
        t.Null(),
      ],
      {
        error:
          "Email harus berupa text dengan format email yang valid atau kosong",
      },
    ),
  ),
  majorId: t.Number({
    minimum: 1,
    error: "ID program harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
  facultyId: t.Number({
    minimum: 1,
    error: "ID fakultas harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
  departmentId: t.Number({
    minimum: 1,
    error: "ID jurusan harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
});
const test = createInsertSchema(schema.test, {
  name: t.String({
    minLength: 1,
    error: "Nama tes harus berupa text dan tidak boleh kosong",
    examples: ["Tes Talenta Mahasiswa"],
  }),
  description: t.Optional(
    t.Union(
      [
        t.String({
          error: "Deskripsi tes tidak valid",
          examples: [
            "Tes Asesmen Talenta Mahasiswa merupakan alat ukur yang dirancang untuk membantu mahasiswa mengenali potensi, kepribadian, serta arah pengembangan diri dan karier mereka. Melalui asesmen ini, mahasiswa akan memperoleh gambaran yang lebih komprehensif mengenai minat, karakteristik personal, dan pola perilaku yang memengaruhi cara mereka belajar, berinteraksi, serta mengambil keputusan dalam kehidupan akademik maupun profesional.",
          ],
        }),
        t.Null(),
      ],
      {
        error: "Deskripsi tes harus berupa text atau kosong",
      },
    ),
  ),
  active: t.Optional(
    t.Boolean({
      error: "Status tes hanya boleh bernilai benar atau salah",
      default: true,
      examples: [true],
    }),
  ),
  parentId: t.Optional(
    t.Union(
      [
        t.Integer({
          minimum: 1,
          error: "ID tes utama tidak boleh negatif atau nol",
          examples: [1],
        }),
        t.Null(),
      ],
      {
        error: "ID tes harus berupa angka atau kosong",
      },
    ),
  ),
});
const testInstruction = createInsertSchema(schema.testInstruction, {
  text: t.String({
    minLength: 1,
    error: "Instruksi tes harus berupa text dan tidak boleh kosong",
    examples: ["Bacalah setiap pertanyaan dengan teliti"],
  }),
  order: t.Number({
    minimum: 0,
    error: "Urutan instruksi harus berupa angka dan tidak boleh negatif",
    examples: [0],
  }),
  testId: t.Number({
    minimum: 1,
    error: "ID tes harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
});
const testNote = createInsertSchema(schema.testNote, {
  text: t.String({
    minLength: 1,
    error: "Catatan tes harus berupa text dan tidak boleh kosong",
    examples: ["Bacalah setiap pertanyaan dengan teliti"],
  }),
  order: t.Number({
    minimum: 0,
    error: "Urutan catatan harus berupa angka dan tidak boleh negatif",
    examples: [0],
  }),
  testId: t.Number({
    minimum: 1,
    error: "ID tes harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
});
const testQuestion = createInsertSchema(schema.testQuestion, {
  text: t.String({
    minLength: 1,
    error: "Pertanyaan tes harus berupa text dan tidak boleh kosong",
    examples: ["Bacalah setiap pertanyaan dengan teliti"],
  }),
  type: t.Enum(TestQuestionType, {
    error:
      "Tipe pertanyaan tidak valid. Pilih salah satu dari: pilihan ganda, pilihan tunggal, atau skala likert",
    examples: [
      TestQuestionType.MultipleChoice,
      TestQuestionType.SingleChoice,
      TestQuestionType.Likert,
    ],
  }),
  order: t.Number({
    minimum: 0,
    error: "Urutan pertanyaan harus berupa angka dan tidak boleh negatif",
    examples: [0],
  }),
  testId: t.Number({
    minimum: 1,
    error: "ID tes harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
});
const testQuestionOption = createInsertSchema(schema.testQuestionOption, {
  text: t.String({
    minLength: 1,
    error: "Opsi pertanyaan harus berupa text dan tidak boleh kosong",
    examples: ["Bacalah setiap pertanyaan dengan teliti"],
  }),
  value: t.String({
    minLength: 1,
    error: "Nilai opsi harus berupa text dan tidak boleh kosong",
    examples: ["Bacalah setiap pertanyaan dengan teliti"],
  }),
  order: t.Number({
    minimum: 0,
    error: "Urutan opsi harus berupa angka dan tidak boleh negatif",
    examples: [0],
  }),
  testQuestionId: t.String({
    format: "uuid",
    error: "ID pertanyaan harus berupa UUID",
    examples: ["019a4351-4e93-707f-b928-4a36ee279482"],
  }),
});
const testSubmission = createInsertSchema(schema.testSubmission, {
  studentId: t.String({
    format: "uuid",
    error: "ID mahasiswa harus berupa UUID",
    examples: ["019a4353-2f21-7c4f-80f8-93eaa7afd6ca"],
  }),
  testId: t.Number({
    minimum: 1,
    error: "ID tes harus berupa angka dan tidak boleh negatif",
    examples: [1],
  }),
  status: t.Enum(TestSubmissionStatus, {
    error:
      "Status submisi tidak valid. Pilih salah satu dari: selesai atau sedang mengerjakan",
    examples: ["completed", "in_progress"],
  }),
  completedAt: t.Optional(
    t.Union(
      [
        t.String({
          format: "date",
          error: "Waktu penyelesaian submisi tidak valid",
        }),
        t.Null(),
      ],
      {
        error: "Waktu harus berupa timestamp atau kosong",
      },
    ),
  ),
});
const testSubmissionAnswer = createInsertSchema(schema.testSubmissionAnswer, {
  id: t.String({
    format: "uuid",
    error: "ID jawaban submisi harus berupa UUID",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
  testSubmissionId: t.String({
    format: "uuid",
    error: "ID submisi tes harus berupa UUID",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
  testQuestionId: t.String({
    format: "uuid",
    error: "ID pertanyaan tes harus berupa UUID",
    examples: ["019a2689-eaf9-7dce-936c-191f988d195c"],
  }),
  selectedOptionId: t.String({
    format: "uuid",
    error: "ID opsi pertanyaan yang dipilih harus berupa UUID",
    examples: ["019a2689-fd2f-7bf3-8733-8883b8f9f6c7"],
  }),
});
const testSubmissionResult = createInsertSchema(schema.testSubmissionResult, {
  testSubmissionId: t.String({
    format: "uuid",
    error: "ID submisi tes harus berupa UUID",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
  testId: t.Number({
    minimum: 1,
    error: "ID tes harus berupa angka dan tidak boleh negatif atau nol",
    examples: [1],
  }),
  result: t.String({
    minLength: 1,
    error:
      "Hasil submisi harus berupa text atau numeric dan tidak boleh kosong",
  }),
});
const user = createInsertSchema(schema.user, {
  username: t.String({
    minLength: 1,
    maxLength: 32,
    pattern: "^[A-Za-z0-9_]+$",
    error:
      "Nama pengguna harus terdiri dari 1 - 32 karakter dan hanya boleh mengandung huruf, angka, dan garis bawah",
    examples: ["user_123", "johnDoe", "alice_01"],
  }),
  password: t.String({
    minLength: 6,
    pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*_]).+$",
    error:
      "Kata sandi harus terdiri dari minimal 6 karakter dan harus setidaknya mengandung satu huruf besar, satu huruf kecil, satu angka, dan satu simbol",
    examples: ["P@ssw0rd", "Admin#123", "User!2024"],
  }),
  role: t.Enum(UserRole, {
    error:
      "Peran pengguna tidak valid. Pilih salah satu dari: Program Studi, Jurusan, Fakultas, Universitas, dan Admin",
    examples: [
      UserRole.Major,
      UserRole.Faculty,
      UserRole.Department,
      UserRole.Admin,
      UserRole.University,
    ],
  }),
});

export const dbModel = {
  select: spreads(
    {
      department: schema.department,
      faculty: schema.faculty,
      major: schema.major,
      student: schema.student,
      test: schema.test,
      testInstruction: schema.testInstruction,
      testNote: schema.testNote,
      testQuestion: schema.testQuestion,
      testQuestionOption: schema.testQuestionOption,
      testSubmission: schema.testSubmission,
      testSubmissionAnswer: schema.testSubmissionAnswer,
      testSubmissionResult: schema.testSubmissionResult,
      user: schema.user,
    },
    "select",
  ),
  insert: spreads(
    {
      department: department,
      faculty: faculty,
      major: major,
      student: student,
      test: test,
      testInstruction: testInstruction,
      testNote: testNote,
      testQuestion: testQuestion,
      testQuestionOption: testQuestionOption,
      testSubmission: testSubmission,
      testSubmissionAnswer: testSubmissionAnswer,
      testSubmissionResult: testSubmissionResult,
      user: user,
    },
    "insert",
  ),
} as const;
