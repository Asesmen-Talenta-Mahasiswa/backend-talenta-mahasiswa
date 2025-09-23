CREATE TYPE "public"."degree_enum" AS ENUM('D3', 'D4', 'S1');--> statement-breakpoint
CREATE TYPE "public"."faculty_enum" AS ENUM('FISIP', 'FEB', 'FMIPA', 'FP', 'FT', 'FH', 'FKIP', 'FK');--> statement-breakpoint
CREATE TYPE "public"."permission_level_enum" AS ENUM('student', 'program', 'department', 'faculty', 'university', 'admin');--> statement-breakpoint
CREATE TYPE "public"."program_enum" AS ENUM('Administrasi Perkantoran', 'Hubungan Masyarakat', 'Perpustakaan', 'Ilmu Administrasi Bisnis', 'Ilmu Administrasi Negara', 'Ilmu Komunikasi', 'Ilmu Pemerintahan', 'Sosiologi', 'Akuntansi', 'Akuntansi PSDKU Way Kanan', 'Keuangan dan Perbankan', 'Manajemen Pemasaran', 'Perbankan dan Keuangan PSDKU Lampung Tengah', 'Perpajakan', 'Bisnis Digital', 'Ekonomi Pembangunan', 'Manajemen', 'Manajemen Informatika', 'Biologi', 'Biologi Terapan', 'Fisika', 'Ilmu Komputer', 'Ilmu Komputer PSDKU Way Kanan', 'Kimia', 'Matematika', 'Sistem Informasi', 'Perkebunan', 'Agribisnis', 'Agronomi', 'Agroteknologi', 'Budidaya Perairan', 'Ilmu Kelautan', 'Ilmu Tanah', 'Kehutanan', 'Nutrisi dan Teknologi Pakan Ternak', 'Penyuluhan Pertanian', 'Peternakan', 'Proteksi Tanaman', 'Sumberdaya Akuatik', 'Teknologi Hasil Pertanian', 'Teknologi Industri Pertanian', 'Teknik Pertanian', 'Teknik Mesin', 'Teknik Sipil', 'Teknik Survey dan Pemetaan', 'Arsitektur', 'Teknik Elektro', 'Teknik Geodesi', 'Teknik Geofisika', 'Teknik Geologi', 'Teknik Informatika', 'Teknik Kimia', 'Teknik Lingkungan', 'Teknologi Rekayasa Otomotif', 'Ilmu Hukum', 'Bimbingan dan Konseling', 'Pendidikan Bahasa dan Sastra Indonesia', 'Pendidikan Bahasa Inggris', 'Pendidikan Bahasa Lampung', 'Pendidikan Bahasa Perancis', 'Pendidikan Biologi', 'Pendidikan Ekonomi', 'Pendidikan Fisika', 'Pendidikan Geografi', 'Pendidikan Guru Pendidikan Anak Usia Dini', 'Pendidikan Guru Sekolah Dasar', 'Pendidikan Jasmani', 'Pendidikan Kimia', 'Pendidikan Matematika', 'Pendidikan Musik', 'Pendidikan Pancasila dan Kewarganegaraan', 'Pendidikan Sejarah', 'Pendidikan Tari', 'Pendidikan Teknologi Informasi', 'Farmasi', 'Kedokteran', 'Gizi');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"npm" char(10) NOT NULL,
	"username" varchar(32) NOT NULL,
	"password" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"program" "program_enum" NOT NULL,
	"department" varchar(100) NOT NULL,
	"faculty" "faculty_enum" NOT NULL,
	"degree" "degree_enum" NOT NULL,
	"permission_level" "permission_level_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_npm_unique" UNIQUE("npm"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
