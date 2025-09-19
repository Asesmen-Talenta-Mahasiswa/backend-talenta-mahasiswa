import {
  pgTable,
  uuid,
  char,
  varchar,
  timestamp,
  pgEnum,
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

export const degreeEnum = pgEnum("degree", ["D3", "D4", "S1"]);

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
  npm: char({ length: 10 }).unique(),
  username: varchar({ length: 32 }).notNull().unique(),
  password: varchar({ length: 32 }),
  program: programEnum().notNull(),
  department: varchar(), // TODO: ask for department list from university
  faculty: facultyEnum().notNull(),
  degree: degreeEnum().notNull(),
  permissionLevel: permissionLevelEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});
