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
  "student",
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

export const careerCategotyEnum = pgEnum("career_category_enum", [
  "praktisi",
  "akademisi",
  "pekerja_kreatif",
  "wirausaha",
]);

export const mbtiTypeEnum = pgEnum("mbti_type_enum", [
  "E",
  "I",
  "S",
  "N",
  "T",
  "F",
  "J",
  "P",
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
  npm: char({ length: 10 }).notNull().unique(),
  username: varchar({ length: 32 }).notNull().unique(),
  password: text().notNull(), // hashed password
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  program: programEnum().notNull(),
  department: varchar({ length: 100 }).notNull(), // TODO: ask for department list from university
  faculty: facultyEnum().notNull(),
  degree: degreeEnum().notNull(),
  permissionLevel: permissionLevelEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const testsTable = pgTable("tests", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 256 }).notNull(),
  type: testTypeEnum().notNull(),
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

export const choicesTable = pgTable("choices", {
  id: uuid().primaryKey().defaultRandom(),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  careerCategory: careerCategotyEnum(), // only for career interest test
  mbtiType: mbtiTypeEnum(), // only for mbti test
  likertValueMin: integer().default(0), // only for likert scale
  likertValueMax: integer().default(5), // only for likert scale
  likertValueLabelMin: varchar({ length: 100 }), // only for likert scale
  likertValueLabelMax: varchar({ length: 100 }), // only for likert scale
  createdAt: timestamp().notNull().defaultNow(),
});
// Note:
// Test minat bidang karir itu single choice
// Test MBTI itu single choice
// Test PWB itu likert scale
// Test Keluhan stress itu multiple choice
