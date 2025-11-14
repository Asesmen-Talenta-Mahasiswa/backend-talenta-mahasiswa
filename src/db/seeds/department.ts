import { type Transaction } from "..";
import { department } from "../schema";

type Department = typeof department.$inferInsert;

const data: Department[] = [
  {
    id: 1,
    name: "Other",
  },
  {
    id: 2,
    name: "Manajemen",
  },
  {
    id: 3,
    name: "Teknik Elektro",
  },
  {
    id: 4,
    name: "Ilmu Pendidikan",
  },
  {
    id: 5,
    name: "Teknik Geodesi Dan Geomatika",
  },
  {
    id: 6,
    name: "Teknik Mesin",
  },
  {
    id: 7,
    name: "Sosiologi",
  },
  {
    id: 8,
    name: "Peternakan",
  },
  {
    id: 9,
    name: "Ilmu Komputer",
  },
  {
    id: 10,
    name: "Hubungan Internasional",
  },
  {
    id: 11,
    name: "Biologi",
  },
  {
    id: 12,
    name: "Adm Negara",
  },
  {
    id: 13,
    name: "Ilmu Administrasi Bisnis",
  },
  {
    id: 14,
    name: "Teknik Geofisika",
  },
  {
    id: 15,
    name: "Pendidikan Ips",
  },
  {
    id: 16,
    name: "Agronomi Dan Hortikultura",
  },
  {
    id: 17,
    name: "Ilmu Komunikasi",
  },
  {
    id: 18,
    name: "Ilmu Pemerintahan",
  },
  {
    id: 19,
    name: "Teknologi Hasil Pertanian",
  },
  {
    id: 20,
    name: "Matematika",
  },
  {
    id: 21,
    name: "Ekonomi Pembangunan",
  },
  {
    id: 22,
    name: "Perikanan Dan Kelautan",
  },
  {
    id: 23,
    name: "Budidaya Tanaman Pangan",
  },
  {
    id: 24,
    name: "Akuntansi",
  },
  {
    id: 25,
    name: "Ilmu Tanah",
  },
  {
    id: 26,
    name: "Arsitektur",
  },
  {
    id: 27,
    name: "Teknologi Industri Pertanian",
  },
  {
    id: 28,
    name: "Teknik Sipil",
  },
  {
    id: 29,
    name: "Kimia",
  },
  {
    id: 30,
    name: "Pendidikan Bahasa Dan Seni",
  },
  {
    id: 31,
    name: "Kehutanan",
  },
  {
    id: 32,
    name: "Proteksi Tanaman",
  },
  {
    id: 33,
    name: "Pendidikan Mipa",
  },
  {
    id: 34,
    name: "Agroteknologi",
  },
  {
    id: 35,
    name: "Agribisnis",
  },
  {
    id: 36,
    name: "Fisika",
  },
  {
    id: 37,
    name: "Teknik Pertanian",
  },
  {
    id: 38,
    name: "Teknik Kimia",
  },
];

export default async function seed(tx: Transaction) {
  await tx.insert(department).values(data);
}
