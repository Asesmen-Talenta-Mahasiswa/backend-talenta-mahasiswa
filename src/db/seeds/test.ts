import { type Transaction } from "..";
import { test } from "../schema";

type Test = typeof test.$inferInsert;

const data: Test[] = [
  {
    id: 1,
    name: "Asesmen Talenta Mahasiswa",
    description:
      "Tes Asesmen Talenta Mahasiswa merupakan alat ukur yang dirancang untuk membantu mahasiswa mengenali potensi, kepribadian, serta arah pengembangan diri dan karier mereka. Melalui asesmen ini, mahasiswa akan memperoleh gambaran yang lebih komprehensif mengenai minat, karakteristik personal, dan pola perilaku yang memengaruhi cara mereka belajar, berinteraksi, serta mengambil keputusan dalam kehidupan akademik maupun profesional.",
    active: true,
  },
  {
    id: 2,
    name: "Bidang Karir Ideal",
    description:
      "Asesmen pada bagian ini akan membantumu untuk mengetahui kecenderungan bidang karir yang ideal untuk kamu tekuni kelak, berdasarkan minat serta karakteristik diri. Terdapat 40 soal yang terbagi menjadi dua sub bagian. Cermati instruksi pada setiap sub. bagiannya ya. Selamat Mengerjakan!",
    parentId: 1,
    active: true,
  },
  {
    id: 3,
    name: "Pola Perilaku",
    description:
      "Asesmen pada bagian ini bertujuan untuk mengetahui pola perilaku yang biasa kamu lakukan sehari - hari, apakah sudah mendukung pengembangan talentamu. Terdapat 36 pernyataan yang akan membantumu melakukan refleksi diri",
    parentId: 1,
    active: true,
  },
  {
    id: 4,
    name: "Minat Karir",
    description:
      "Mengukur kecenderungan dan ketertarikan individu terhadap berbagai bidang pekerjaan dan karier. Hasilnya membantu mahasiswa memahami bidang kerja yang paling sesuai dengan minat dan nilai pribadi, serta memberikan arah dalam merencanakan jalur karier masa depan.",
    parentId: 2,
    active: true,
  },
  {
    id: 5,
    name: "Karakteristik Diri",
    description:
      "Berdasarkan kerangka Myers-Briggs Type Indicator (MBTI), subtes ini menggali preferensi dasar dalam cara berpikir, berinteraksi, dan mengambil keputusan. Hasilnya menunjukkan tipe kepribadian mahasiswa, yang dapat menjadi panduan dalam mengenali kekuatan diri, potensi pengembangan, serta gaya kerja yang paling sesuai.",
    parentId: 2,
    active: true,
  },
  {
    id: 6,
    name: "Kesejahteraan Psikologis",
    description:
      "Tes Psychological Well-Being (PWB) merupakan alat asesmen yang dirancang untuk mengukur tingkat kesejahteraan psikologis individu. Tes ini membantu memahami sejauh mana seseorang merasa bahagia, berfungsi secara positif, dan mampu mengembangkan potensi dirinya dalam kehidupan sehari-hari.",
    parentId: 3,
    active: true,
  },
];

export default async function seed(tx: Transaction) {
  await tx.insert(test).values(data);
}
