import { type Transaction } from "..";
import { major } from "../schema";

type Major = typeof major.$inferInsert;

const data: Major[] = [
  {
    id: 1,
    name: "Other",
  },
  {
    id: 2,
    name: "Peternakan",
  },
  {
    id: 3,
    name: "Pendidikan Matematika",
  },
  {
    id: 4,
    name: "Ilmu Hukum",
  },
  {
    id: 5,
    name: "Ilmu Administrasi Bisnis",
  },
  {
    id: 6,
    name: "Pendidikan Guru Sekolah Dasar",
  },
  {
    id: 7,
    name: "Pendidikan Bahasa Dan Sastra Daerah",
  },
  {
    id: 8,
    name: "Manajemen Sumber Daya Alam",
  },
  {
    id: 9,
    name: "Pjj Pendidikan Vokasional Teknik Mesin",
  },
  {
    id: 10,
    name: "Pendidikan Guru Pendidikan Anak Usia Dini",
  },
  {
    id: 11,
    name: "Ilmu Pemerintahan",
  },
  {
    id: 12,
    name: "Teknik Mesin",
  },
  {
    id: 13,
    name: "Teknologi Laboratorium Medis",
  },
  {
    id: 14,
    name: "Seni Tari",
  },
  {
    id: 15,
    name: "Farmasi",
  },
  {
    id: 16,
    name: "Perpajakan",
  },
  {
    id: 17,
    name: "Pendidikan Profesi Guru",
  },
  {
    id: 18,
    name: "Bahasa Inggris",
  },
  {
    id: 19,
    name: "Gizi",
  },
  {
    id: 20,
    name: "Pendidikan Olahraga",
  },
  {
    id: 21,
    name: "Ilmu Komputer (kampus Kabupaten Way Kanan)",
  },
  {
    id: 22,
    name: "Kehutanan",
  },
  {
    id: 23,
    name: "Penyuluhan Perikanan",
  },
  {
    id: 24,
    name: "Keperawatan",
  },
  {
    id: 25,
    name: "Analis Kimia",
  },
  {
    id: 26,
    name: "Teknik Sipil",
  },
  {
    id: 27,
    name: "Perikanan Tangkap",
  },
  {
    id: 28,
    name: "Pendidikan Agama Islam",
  },
  {
    id: 29,
    name: "Pskgj Pendidikan Bahasa Dan Sastra Indonesia Dan Daerah",
  },
  {
    id: 30,
    name: "Pendidikan Fisika",
  },
  {
    id: 31,
    name: "Periklanan",
  },
  {
    id: 32,
    name: "Pskgj Pendidikan Bahasa Inggris",
  },
  {
    id: 33,
    name: "Teknik Perkapalan",
  },
  {
    id: 34,
    name: "Pendidikan Kimia",
  },
  {
    id: 35,
    name: "Sistem Informasi",
  },
  {
    id: 36,
    name: "Pendidikan Bahasa Inggris",
  },
  {
    id: 37,
    name: "Pendidikan Jasmani",
  },
  {
    id: 38,
    name: "Keguruan Ilmu Pengetahuan Alam",
  },
  {
    id: 39,
    name: "Teknologi Akuakultur",
  },
  {
    id: 40,
    name: "Teknik Elektro Medik",
  },
  {
    id: 41,
    name: "Teknik Elektronika",
  },
  {
    id: 42,
    name: "Ilmu Ekonomi",
  },
  {
    id: 43,
    name: "Kebidanan",
  },
  {
    id: 44,
    name: "Akuntansi",
  },
  {
    id: 45,
    name: "Kedokteran",
  },
  {
    id: 46,
    name: "Manajemen Informatika",
  },
  {
    id: 47,
    name: "Profesi Akuntan",
  },
  {
    id: 48,
    name: "Agroteknologi",
  },
  {
    id: 49,
    name: "Pendidikan Vokasional Teknik Mesin",
  },
  {
    id: 50,
    name: "Pjj Pendidikan Guru Sekolah Dasar",
  },
  {
    id: 51,
    name: "Manajemen",
  },
  {
    id: 52,
    name: "Ekonomi Syariah",
  },
  {
    id: 53,
    name: "Keguruan Guru Sekolah Dasar",
  },
  {
    id: 54,
    name: "Pengelolaan Proyek Dan Bisnis",
  },
  {
    id: 55,
    name: "Teknik Pertanian",
  },
  {
    id: 56,
    name: "Teknik Geofisika",
  },
  {
    id: 57,
    name: "Refraksi Optisi",
  },
  {
    id: 58,
    name: "Pskgj Pendidikan Biologi",
  },
  {
    id: 59,
    name: "Profesi Insinyur",
  },
  {
    id: 60,
    name: "Sanitasi",
  },
  {
    id: 61,
    name: "Kesehatan Masyarakat",
  },
  {
    id: 62,
    name: "Pendidikan Islam Anak Usia Dini",
  },
  {
    id: 63,
    name: "Budi Daya Ikan",
  },
  {
    id: 64,
    name: "Pskgj Pendidikan Geografi",
  },
  {
    id: 65,
    name: "Ilmu Akuntansi",
  },
  {
    id: 66,
    name: "Teknik Informatika",
  },
  {
    id: 67,
    name: "Sosiologi",
  },
  {
    id: 68,
    name: "Teknologi Hasil Pertanian",
  },
  {
    id: 69,
    name: "Teknik Pertambangan",
  },
  {
    id: 70,
    name: "Pendidikan Teknik Mesin",
  },
  {
    id: 71,
    name: "Pendidikan Pancasila Dan Kewarganegaraan",
  },
  {
    id: 72,
    name: "Bisnis Digital",
  },
  {
    id: 73,
    name: "Pendidikan Ekonomi",
  },
  {
    id: 74,
    name: "Fotografi",
  },
  {
    id: 75,
    name: "Teknik Lingkungan",
  },
  {
    id: 76,
    name: "Ilmu Penyuluhan Pembangunan/ Pemberdayaan Masyarakat",
  },
  {
    id: 77,
    name: "Pskgj Pendidikan Sejarah",
  },
  {
    id: 78,
    name: "Pendidikan Profesi Ners",
  },
  {
    id: 79,
    name: "Ilmu Komunikasi",
  },
  {
    id: 80,
    name: "Administrasi Pendidikan",
  },
  {
    id: 81,
    name: "Teknologi Pangan",
  },
  {
    id: 82,
    name: "Studi Pembangunan",
  },
  {
    id: 83,
    name: "Teknologi Rekayasa Otomotif",
  },
  {
    id: 84,
    name: "Ilmu Keperawatan",
  },
  {
    id: 85,
    name: "Psikologi",
  },
  {
    id: 86,
    name: "Pendidikan Geografi",
  },
  {
    id: 87,
    name: "Sekretari",
  },
  {
    id: 88,
    name: "Teknik Elektro",
  },
  {
    id: 89,
    name: "Pendidikan Bahasa Dan Sastra Indonesia",
  },
  {
    id: 90,
    name: "Keuangan Dan Perbankan",
  },
  {
    id: 91,
    name: "Pendidikan Bahasa Lampung",
  },
  {
    id: 92,
    name: "Pendidikan Musik",
  },
  {
    id: 93,
    name: "Arsitektur",
  },
  {
    id: 94,
    name: "Sanitasi Lingkungan",
  },
  {
    id: 95,
    name: "Profesi Dokter",
  },
  {
    id: 96,
    name: "Perbankan Dan Keuangan (kampus Kab Lampung Tengah)",
  },
  {
    id: 97,
    name: "Kebidanan (kampus Metro)",
  },
  {
    id: 98,
    name: "Proteksi Tanaman",
  },
  {
    id: 99,
    name: "Arsitektur Lansekap",
  },
  {
    id: 100,
    name: "Teknologi Pengolahan Hasil Perikanan",
  },
  {
    id: 101,
    name: "Pengelolaan Perhotelan",
  },
  {
    id: 102,
    name: "Akuntansi Perpajakan",
  },
  {
    id: 103,
    name: "Produksi Tanaman Pangan",
  },
  {
    id: 104,
    name: "Animasi",
  },
  {
    id: 105,
    name: "Pskgj Pendidikan Kewarganegaraan",
  },
  {
    id: 106,
    name: "Ilmu Administrasi",
  },
  {
    id: 107,
    name: "Agribisnis",
  },
  {
    id: 108,
    name: "Sumberdaya Akuatik",
  },
  {
    id: 109,
    name: "Ilmu Politik",
  },
  {
    id: 110,
    name: "Pendidikan Seni Drama, Tari Dan Musik",
  },
  {
    id: 111,
    name: "Pendidikan Bahasa Perancis",
  },
  {
    id: 112,
    name: "Teknik Komputer",
  },
  {
    id: 113,
    name: "Pskgj Pendidikan Guru Sekolah Dasar(pgsd)",
  },
  {
    id: 114,
    name: "Ilmu Kehutanan",
  },
  {
    id: 115,
    name: "Seni Kuliner",
  },
  {
    id: 116,
    name: "Desain Mode",
  },
  {
    id: 117,
    name: "Akuntansi (kampus Kab. Way Kanan)",
  },
  {
    id: 118,
    name: "Teknologi Penangkapan Ikan",
  },
  {
    id: 119,
    name: "Informatika",
  },
  {
    id: 120,
    name: "Ilmu Pertanian",
  },
  {
    id: 121,
    name: "Pulmonologi Dan Ilmu Kedokteran Respirasi",
  },
  {
    id: 122,
    name: "Pendidikan Teknik Informatika & Komputer",
  },
  {
    id: 123,
    name: "Ilmu Lingkungan",
  },
  {
    id: 124,
    name: "Ilmu Administrasi Publik",
  },
  {
    id: 125,
    name: "Administrasi Publik",
  },
  {
    id: 126,
    name: "Pendidikan Ips",
  },
  {
    id: 127,
    name: "Administrasi Bisnis",
  },
  {
    id: 128,
    name: "Teknik Geomatika",
  },
  {
    id: 129,
    name: "Hukum",
  },
  {
    id: 130,
    name: "Ilmu Komputer",
  },
  {
    id: 131,
    name: "Teknik Survey Dan Pemetaan",
  },
  {
    id: 132,
    name: "Pendidikan Jasmani Kesehatan Dan Rekreasi",
  },
  {
    id: 133,
    name: "Bimbingan Dan Konseling",
  },
  {
    id: 134,
    name: "Pendidikan",
  },
  {
    id: 135,
    name: "Nutrisi Dan Teknologi Pakan Ternak",
  },
  {
    id: 136,
    name: "Perencanaan Wilayah Dan Kota",
  },
  {
    id: 137,
    name: "Penyuluhan Pertanian",
  },
  {
    id: 138,
    name: "Penyuluhan Dan Komunikasi Pertanian",
  },
  {
    id: 139,
    name: "Ekonomi Pembangunan",
  },
  {
    id: 140,
    name: "Pengolahan Hasil Laut",
  },
  {
    id: 141,
    name: "Pendidikan Jasmani, Kesehatan Dan Rekreas",
  },
  {
    id: 142,
    name: "Ilmu Tanah",
  },
  {
    id: 143,
    name: "Ilmu Administrasi Negara",
  },
  {
    id: 144,
    name: "Akuakultur",
  },
  {
    id: 145,
    name: "Teknik Grafika (kampus Kota Makassar)",
  },
  {
    id: 146,
    name: "Pendidikan Bahasa Dan Kebudayaan Lampung",
  },
  {
    id: 147,
    name: "Teknologi Industri Pertanian",
  },
  {
    id: 148,
    name: "Kimia",
  },
  {
    id: 149,
    name: "Biologi Terapan",
  },
  {
    id: 150,
    name: "Matematika",
  },
  {
    id: 151,
    name: "Sistem Informasi Akuntansi",
  },
  {
    id: 152,
    name: "Pendidikan Teknologi Informasi",
  },
  {
    id: 153,
    name: "Teknologi Pendidikan",
  },
  {
    id: 154,
    name: "Teknologi Hasil Perikanan",
  },
  {
    id: 155,
    name: "Permesinan Perikanan",
  },
  {
    id: 156,
    name: "Hubungan Internasional",
  },
  {
    id: 157,
    name: "Hubungan Masyarakat",
  },
  {
    id: 158,
    name: "Teknologi Informasi",
  },
  {
    id: 159,
    name: "Ekonomi Artha Sastra",
  },
  {
    id: 160,
    name: "Ilmu Teknik Sipil",
  },
  {
    id: 161,
    name: "Agronomi",
  },
  {
    id: 162,
    name: "Teknik Industri",
  },
  {
    id: 163,
    name: "Fisika",
  },
  {
    id: 164,
    name: "Teknik Geodesi",
  },
  {
    id: 165,
    name: "Pendidikan Sejarah",
  },
  {
    id: 166,
    name: "Teknik Kemasan",
  },
  {
    id: 167,
    name: "Pariwisata",
  },
  {
    id: 168,
    name: "Manajemen Wilayah Pesisir Dan Laut",
  },
  {
    id: 169,
    name: "Agribisnis Pangan",
  },
  {
    id: 170,
    name: "Desain Grafis",
  },
  {
    id: 171,
    name: "Survei Dan Pemetaan",
  },
  {
    id: 172,
    name: "Desain Grafis (kampus Kota Makassar)",
  },
  {
    id: 173,
    name: "Pendidikan Agama Hindu",
  },
  {
    id: 174,
    name: "Statistika",
  },
  {
    id: 175,
    name: "Sastra Inggris",
  },
  {
    id: 176,
    name: "Penerbitan",
  },
  {
    id: 177,
    name: "Budidaya Perairan",
  },
  {
    id: 178,
    name: "Pendidikan Jasmani, Kesehatan Dan Rekreasi",
  },
  {
    id: 179,
    name: "Teknologi Permainan",
  },
  {
    id: 180,
    name: "Pskgj Pendidikan Matematika",
  },
  {
    id: 181,
    name: "Ilmu Kelautan",
  },
  {
    id: 182,
    name: "Perkebunan",
  },
  {
    id: 183,
    name: "Manajemen Pemasaran",
  },
  {
    id: 184,
    name: "Teknik Geologi",
  },
  {
    id: 185,
    name: "Pendidikan Biologi",
  },
  {
    id: 186,
    name: "Teknik Kimia",
  },
  {
    id: 187,
    name: "Biologi",
  },
  {
    id: 188,
    name: "Ketatalaksanaan Pelayaran Niaga Dan Kepel",
  },
  {
    id: 189,
    name: "Teknik Grafika",
  },
  {
    id: 190,
    name: "Perpustakaan",
  },
  {
    id: 191,
    name: "Manajemen Pendidikan Islam",
  },
  {
    id: 192,
    name: "Pskgj Pendidikan Kimia",
  },
  {
    id: 193,
    name: "Pendidikan Tari",
  },
  {
    id: 194,
    name: "Teknik Gigi",
  },
  {
    id: 195,
    name: "Ilmu Hubungan Internasional",
  },
  {
    id: 196,
    name: "Pendidikan Dokter",
  },
  {
    id: 197,
    name: "Kesehatan Gigi",
  },
  {
    id: 198,
    name: "Sistem Komputer",
  },
  {
    id: 199,
    name: "Administrasi Perkantoran",
  },
  {
    id: 200,
    name: "Teknik Perkeretaapian",
  },
  {
    id: 201,
    name: "Sumber Daya Perairan",
  },
  {
    id: 202,
    name: "Matematika Dan Ilmu Pengetahuan Alam",
  },
  {
    id: 203,
    name: "Pendidikan Vokasional Teknologi Informasi",
  },
  {
    id: 204,
    name: "Pendidikan Ilmu Pengetahuan Alam",
  },
  {
    id: 205,
    name: "Pskgj Pendidikan Fisika",
  },
];

export default async function seed(tx: Transaction) {
  await tx.insert(major).values(data);
}
