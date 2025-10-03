import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  char,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// Define the permission level enum
export const permissionLevelEnum = pgEnum("permission_level_enum", [
  "program",
  "department",
  "faculty",
  "university",
  "admin",
]);

export const facultyEnum = pgEnum("faculty_enum", [
  "FISIP",
  "FEB",
  "FMIPA",
  "FP",
  "FT",
  "FH",
  "FKIP",
  "FK",
]);

export const degreeEnum = pgEnum("degree_enum", ["D3", "D4", "S1"]);

export const programEnum = pgEnum("program_enum", [
  // FISIP
  "Administrasi Perkantoran",
  "Hubungan Masyarakat",
  "Perpustakaan",
  "Ilmu Administrasi Bisnis",
  "Ilmu Administrasi Negara",
  "Ilmu Komunikasi",
  "Ilmu Pemerintahan",
  "Sosiologi",

  // FEB
  "Akuntansi",
  "Akuntansi PSDKU Way Kanan",
  "Keuangan dan Perbankan",
  "Manajemen Pemasaran",
  "Perbankan dan Keuangan PSDKU Lampung Tengah",
  "Perpajakan",
  "Bisnis Digital",
  "Ekonomi Pembangunan",
  "Manajemen",

  // FMIPA
  "Manajemen Informatika",
  "Biologi",
  "Biologi Terapan",
  "Fisika",
  "Ilmu Komputer",
  "Ilmu Komputer PSDKU Way Kanan",
  "Kimia",
  "Matematika",
  "Sistem Informasi",

  // FP (Pertanian)
  "Perkebunan",
  "Agribisnis",
  "Agronomi",
  "Agroteknologi",
  "Budidaya Perairan",
  "Ilmu Kelautan",
  "Ilmu Tanah",
  "Kehutanan",
  "Nutrisi dan Teknologi Pakan Ternak",
  "Penyuluhan Pertanian",
  "Peternakan",
  "Proteksi Tanaman",
  "Sumberdaya Akuatik",
  "Teknologi Hasil Pertanian",
  "Teknologi Industri Pertanian",
  "Teknik Pertanian",

  // FT (Teknik)
  "Teknik Mesin",
  "Teknik Sipil",
  "Teknik Survey dan Pemetaan",
  "Arsitektur",
  "Teknik Elektro",
  "Teknik Geodesi",
  "Teknik Geofisika",
  "Teknik Geologi",
  "Teknik Informatika",
  "Teknik Kimia",
  "Teknik Lingkungan",
  "Teknologi Rekayasa Otomotif", // Sarjana Terapan (D4)

  // FH
  "Ilmu Hukum",

  // FKIP
  "Bimbingan dan Konseling",
  "Pendidikan Bahasa dan Sastra Indonesia",
  "Pendidikan Bahasa Inggris",
  "Pendidikan Bahasa Lampung",
  "Pendidikan Bahasa Perancis",
  "Pendidikan Biologi",
  "Pendidikan Ekonomi",
  "Pendidikan Fisika",
  "Pendidikan Geografi",
  "Pendidikan Guru Pendidikan Anak Usia Dini",
  "Pendidikan Guru Sekolah Dasar",
  "Pendidikan Jasmani",
  "Pendidikan Kimia",
  "Pendidikan Matematika",
  "Pendidikan Musik",
  "Pendidikan Pancasila dan Kewarganegaraan",
  "Pendidikan Sejarah",
  "Pendidikan Tari",
  "Pendidikan Teknologi Informasi",

  // FK (Kesehatan)
  "Farmasi",
  "Kedokteran",
  "Gizi",
]);

export const questionTypeEnum = pgEnum("question_type_enum", [
  "multiple_choice",
  "single_choice",
  "likert",
]);

export const testTypeEnum = pgEnum("test_type_enum", [
  "career_interest",
  "mbti",
  "pwb",
  "stress_source",
]);

export const careerCategoryEnum = pgEnum("career_category_enum", [
  "praktisi",
  "akademisi",
  "pekerja_kreatif",
  "wirausaha",
]);

export const mbtiDimensionEnum = pgEnum("mbti_dimension_enum", [
  "E",
  "I",
  "S",
  "N",
  "T",
  "F",
  "J",
  "P",
]);

export const careerFieldResultEnum = pgEnum("career_field_result_enum", [
  "very_suitable",
  "quite_suitable",
  "not_suitable",
]);

export const pwbResultEnum = pgEnum("pwb_result_enum", [
  "low",
  "medium",
  "high",
]);

export const talentResultEnum = pgEnum("talent_result_enum", [
  "analyst",
  "diplomat",
  "sentinel",
  "explorer",
]);

// User table schema
// This table merge all user roles into a single table with a permission level field
// The permission levels are:
// - student: regular student user
// - program: program head
// - department: department head
// - faculty: faculty head
// - university: university admin
// - admin: system admin
export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 32 }).notNull().unique(),
  password: text().notNull(), // hashed password
  permissionLevel: permissionLevelEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const studentsTable = pgTable("students", {
  id: uuid().primaryKey().defaultRandom(),
  npm: char({ length: 10 }).notNull().unique(), // e.g. 2215061066
  name: varchar({ length: 128 }).notNull(),
  email: varchar({ length: 128 }),
  program: programEnum().notNull(),
  department: varchar(), // TODO: ask for department list from university
  faculty: facultyEnum().notNull(),
  degree: degreeEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const testsTable = pgTable("tests", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 256 }).notNull(),
  description: text().notNull(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp().notNull().defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: uuid().primaryKey().defaultRandom(),
  testId: uuid()
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  type: questionTypeEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const multipleChoiceOptionsTable = pgTable("multiple_choice_options", {
  id: uuid().primaryKey().defaultRandom(),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  careerCategory: careerCategoryEnum(), // only for career interest test
  mbtiType: mbtiDimensionEnum(), // only for mbti test
  createdAt: timestamp().notNull().defaultNow(),
});

export const singleChoiceOptionsTable = pgTable("single_choice_options", {
  id: uuid().primaryKey().defaultRandom(),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  careerCategory: careerCategoryEnum(), // only for career interest test
  mbtiType: mbtiDimensionEnum(), // only for mbti test
  createdAt: timestamp().notNull().defaultNow(),
});

export const likertOptionsTable = pgTable("likert_options", {
  id: uuid().primaryKey().defaultRandom(),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  likertValueMin: integer().default(1),
  likertValueMax: integer().default(5),
  likertValueLabelMin: text(),
  likertValueLabelMax: text(),
  createdAt: timestamp().notNull().defaultNow(),
});
// Note:
// Test minat bidang karir itu single choice
// Test MBTI itu single choice
// Test PWB itu likert scale
// Test Keluhan stress itu multiple choice

export const resultsTable = pgTable("results", {
  id: uuid().primaryKey().defaultRandom(),
  studentId: uuid()
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  careerCategory: careerCategoryEnum().notNull(), // from career interest test result
  mbtiType: varchar({ length: 4 }).notNull(), // from mbti test result, e.g. INFP
  pwbScore: integer().notNull(), // from pwb test result, range 0-100
  createdAt: timestamp({ mode: "string" }).notNull().defaultNow(),
});

// Tests <-> Questions
export const testsRelations = relations(testsTable, ({ many }) => ({
  questions: many(questionsTable),
}));

// Questions -> Tests, Question -> Options
export const questionsRelations = relations(
  questionsTable,
  ({ one, many }) => ({
    test: one(testsTable, {
      fields: [questionsTable.testId],
      references: [testsTable.id],
    }),
    multipleChoiceOptions: many(multipleChoiceOptionsTable),
    singleChoiceOptions: many(singleChoiceOptionsTable),
    likertOptions: many(likertOptionsTable),
  })
);

// Multiple choice options -> Question
export const multipleChoiceOptionsRelations = relations(
  multipleChoiceOptionsTable,
  ({ one }) => ({
    question: one(questionsTable, {
      fields: [multipleChoiceOptionsTable.questionId],
      references: [questionsTable.id],
    }),
  })
);

// Single choice options -> Question
export const singleChoiceOptionsRelations = relations(
  singleChoiceOptionsTable,
  ({ one }) => ({
    question: one(questionsTable, {
      fields: [singleChoiceOptionsTable.questionId],
      references: [questionsTable.id],
    }),
  })
);

// Likert options -> Question
export const likertOptionsRelations = relations(
  likertOptionsTable,
  ({ one }) => ({
    question: one(questionsTable, {
      fields: [likertOptionsTable.questionId],
      references: [questionsTable.id],
    }),
  })
);

// Students <-> Results
export const studentsRelations = relations(studentsTable, ({ many }) => ({
  results: many(resultsTable),
}));

export const resultsRelations = relations(resultsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [resultsTable.studentId],
    references: [studentsTable.id],
  }),
}));
