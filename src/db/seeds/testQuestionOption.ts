import { randomUUIDv7 } from "bun";
import { type Transaction } from "..";
import { testQuestionOption } from "../schema";
import { data as testQuestionData } from "./testQuestion";

type TestQuestionOption = typeof testQuestionOption.$inferInsert;

// Generate data function to create fresh UUIDs on each seed
function generateData(): TestQuestionOption[] {
  const options: TestQuestionOption[] = [];

  // Test 4 Questions - 12 questions with 4 options each (Praktisi, Akademisi, Pekerja Kreatif, Wirausaha)
  const test4Options = [
    // Question 1
    [
      "Membaca lalu membuat rangkuman yang mudah dibaca ulang.",
      "Mencari sumber informasi lain yang dapat membantu memahami materi tersebut.",
      "Membuat diagram, mindmap atau catatan kreatif lainnya dengan warna dan gambar.",
      "Diskusi kelompok sambil memimpin pembicaraan agar semua memahami.",
    ],
    // Question 2
    [
      "Tugas yang disertai dengan instruksi pengerjaan yang jelas.",
      "Tugas yang menantang saya untuk berpikir kritis dan mendalam.",
      "Tugas yang memberikan saya kebebasan untuk ide unik dan kreatif.",
      "Proyek kelompok yang memberi kesempatan saya mengatur strategi dan memandu kelompok.",
    ],
    // Question 3
    [
      "Menangani bagian teknis, seperti merapikan makalah atau bahan presentasi.",
      "Mengumpulkan informasi dan data serta mengkonsep cara pengerjaan tugas.",
      "Mencari ide-ide segar agar tugas lebih menarik dan unik.",
      "Mengarahkan kelompok dan mengatur strategi pengerjaan tugas.",
    ],
    // Question 4
    [
      "Bisa membantu saya menyelesaikan tugas secara praktis dan cepat.",
      "Bisa mengimbangi saya untuk berdiskusi serta menganalisis permasalahan secara mendalam.",
      "Bisa memahami manfaat dari ide-ide unik yang saya miliki.",
      "Punya semangat tinggi, aktif, dan mampu memotivasi saya.",
    ],
    // Question 5
    [
      "Cekatan serta mampu untuk bekerja dengan sistematis & terstruktur.",
      "Pintar mencari referensi lain atau tambahan data untuk memperkuat tugas.",
      'Asik diajak berdiskusi untuk mengembangkan ide baru, tidak "anti" dengan ide baru.',
      "Mudah memahami arahan yang saya berikan.",
    ],
    // Question 6
    [
      "Menyusun slide dan mempersiapkan teknis presentasi.",
      "Mengumpulkan teori/literatur untuk isi presentasi.",
      "Mengkreasikan tampilan slide presentasi agar lebih estetik & mudah dipahami.",
      "Mengkoordinir & memoderatori/memimpin jalannya presentasi.",
    ],
    // Question 7
    [
      "Memberikan saran praktis yang bisa langsung diterapkan.",
      "Menganalisis apa yang menjadi sumber dari kesulitan yang ada.",
      "Merenung memikirkan ide kreatif untuk menghadapi kesulitan tersebut.",
      "Memotivasi teman-teman lain agar tetap bersemangat meskipun ada kesulitan.",
    ],
    // Question 8
    [
      "Menjelaskan materi dengan cara yang mudah dan praktis.",
      "Memberi pemahaman mendalam dengan konsep dan teori.",
      "Menjelaskan dengan cara menarik, seperti gambar atau contoh yang unik.",
      "Membuat strategi belajar bersama dan memotivasinya untuk mencoba.",
    ],
    // Question 9
    [
      "Memberikan contoh nyata dan langsung menunjukkan cara penerapannya.",
      "Mengajak berpikir kritis dengan teori dan kajian yang mendalam.",
      "Memberikan materi pelajaran & tugas yang mendorong mahasiswa untuk berpikir kreatif.",
      "Menciptakan suasana kompetisi di kelas.",
    ],
    // Question 10
    [
      "Komunitas yang fokus pada keterampilan teknis, seperti klub olahraga atau laboratorium.",
      "Komunitas akademik seperti kelompok riset atau diskusi ilmiah.",
      "Komunitas yang menekankan seni, kreativitas, atau desain.",
      "Komunitas wirausaha atau organisasi kepemimpinan.",
    ],
    // Question 11
    [
      "Beraktivitas yang tidak terlalu banyak menyita pikiran serta langsung terlihat hasilnya seperti olahraga atau masak.",
      "Mengasah pikiran dengan membaca buku atau menonton video edukatif.",
      "Membuat karya / project pribadi seperti menggambar, menulis, atau editing video.",
      "Merencanakan ide proyek atau usaha kecil-kecilan.",
    ],
    // Question 12
    [
      "Praktisi – profesi yang menerapkan ilmu secara praktis.",
      "Akademisi – profesi yang meneliti & mengembangkan ilmu.",
      "Pekerja Kreatif – profesi yang menciptakan berbagai produk & karya kreatif.",
      "Wirausaha – profesi yang membangun bisnis secara mandiri.",
    ],
  ];

  const test4Values = ["praktisi", "akademisi", "pekerja_kreatif", "wirausaha"];

  // Add Test 4 options
  test4Options.forEach((questionOptions, questionIndex) => {
    questionOptions.forEach((optionText, optionIndex) => {
      const question = testQuestionData[questionIndex];
      if (!question || !question.id) return;
      options.push({
        id: randomUUIDv7(),
        text: optionText,
        value: test4Values[optionIndex],
        order: optionIndex,
        testQuestionId: question.id,
      });
    });
  });

  // Test 5 Questions - 28 questions with 2 options each (Pilihan A, Pilihan B)
  const test5Options = [
    // Question 1
    ["Berdiskusi", "Merenung sendiri"],
    // Question 2
    ["Ramai & bersemangat", "Sunyi & menenangkan"],
    // Question 3
    ["Aktif & interaktif", "Tenang & teratur"],
    // Question 4
    [
      "Aktif mengikuti diskusi & tanya jawab di kelas",
      "Mendengarkan, membaca & mencatat sendiri",
    ],
    // Question 5
    ["Diskusi & tanya jawab dengan teman", "Membaca ulang catatan sendiri"],
    // Question 6
    ["Tugas kelompok", "Tugas individu"],
    // Question 7
    ["Jalan-jalan bersama teman-teman", "Santai di rumah sendirian"],
    // Question 8
    [
      "Menyusun poin-poin yang jelas & terstruktur",
      "Mengembangkan presentasi dengan alur yang unik & kreatif",
    ],
    // Question 9
    [
      "Sesuai dengan kata-kata yang digunakan dosen",
      "Meringkas dengan bahasa saya sendiri",
    ],
    // Question 10
    [
      "Melakukan praktik nyata & simulasi langsung",
      "Diminta mengembangkan ide baru yang kreatif",
    ],
    // Question 11
    [
      "Menyumbang data, informasi, sumber referensi",
      "Ide kreatif tentang cara mengerjakan tugas",
    ],
    // Question 12
    [
      "Menyalin ulang detail dari buku/catatan",
      "Membuat diagram/ilustrasi untuk menangkap ide utamanya",
    ],
    // Question 13
    [
      "Tips-tips praktis yang bisa langsung diterapkan",
      "Ide-ide besar yang inspiratif",
    ],
    // Question 14
    [
      "Dosen memberi contoh nyata dan praktis",
      "Dosen memberi analogi-analogi kreatif",
    ],
    // Question 15
    [
      "Mempertahankan argumen yang saya yakini benar",
      "Menjaga agar suasana tetap harmonis",
    ],
    // Question 16
    [
      "Kualitas struktur logika & isi materi",
      "Usaha, semangat & kerjasama kelompok",
    ],
    // Question 17
    [
      "Menjelaskan materi dengan sistematis & rasional agar dia mudah memahami",
      "Memberikan dorongan & semangat agar dia mau terus mencoba",
    ],
    // Question 18
    [
      "Mengingatkan bagian tugas yang menjadi tanggung jawabnya serta batas waktu pengerjaan tugas",
      "Mengajak berdiskusi untuk memahami alasan mengapa ia kurang berkontribusi",
    ],
    // Question 19
    [
      "Efisiensi kerja supaya cepat selesai",
      "Kebersamaan agar semua merasa dihargai",
    ],
    // Question 20
    [
      "Orang yang berpikir logis, kritis dan konsisten",
      "Orang yang peduli dan bisa memahami perasaan saya",
    ],
    // Question 21
    [
      "Memberikan solusi praktis yang bisa langsung diterapkan",
      "Memberikan semangat & dukungan emosi",
    ],
    // Question 22
    [
      "Membuat outline terstruktur sebelum menulis",
      "Menulis ide yang muncul dulu, lalu merapikan belakangan",
    ],
    // Question 23
    [
      "Menyusun strategi dan jadwal pengerjaan tugas dengan teratur",
      "Mengerjakan secara fleksibel sesuai mana yang terasa mudah dulu",
    ],
    // Question 24
    [
      "Kegiatan dengan rutinitas yang cenderung terjadwal",
      "Jadwal kegiatan yang cenderung fleksibel sesuai kondisi harian",
    ],
    // Question 25
    ["Alur serta poin-poin pembahasannya jelas", "Mengalir bebas saja"],
    // Question 26
    [
      "Mencoba mencari informasi dan mempersiapkan materi tugas sebelum bertemu teman kelompok",
      "Mulai bekerja setelah bertemu dengan teman kelompok",
    ],
    // Question 27
    [
      "Merencanakan kalimat yang akan disampaikan dengan detail setiap slidenya",
      "Mempersiapkan beberapa kalimat kunci & mengembangkannya saat presentasi",
    ],
    // Question 28
    [
      "Membaca sesuai dengan urutan bab buku / artikel",
      "Membaca acak sesuai dengan keinginan",
    ],
  ];

  const test5StartIndex = 12; // Test 4 has 12 questions

  // Add Test 5 options
  test5Options.forEach((questionOptions, questionIndex) => {
    questionOptions.forEach((optionText, optionIndex) => {
      const question = testQuestionData[test5StartIndex + questionIndex];
      if (!question || !question.id) return;
      options.push({
        id: randomUUIDv7(),
        text: optionText,
        value: optionIndex === 0 ? "A" : "B",
        order: optionIndex,
        testQuestionId: question.id,
      });
    });
  });

  // Test 6 Questions - 36 questions with 5 options each (Likert scale 1-5)
  // Favorable questions: score 1→5 (Gak Juga → Iya Lagi)
  // Unfavorable questions: score 5→1 (Gak Juga → Iya Lagi)
  const test6Questions = [
    { favorable: true }, // 1
    { favorable: false }, // 2
    { favorable: true }, // 3
    { favorable: false }, // 4
    { favorable: true }, // 5
    { favorable: false }, // 6
    { favorable: true }, // 7
    { favorable: false }, // 8
    { favorable: true }, // 9
    { favorable: false }, // 10
    { favorable: true }, // 11
    { favorable: false }, // 12
    { favorable: true }, // 13
    { favorable: false }, // 14
    { favorable: true }, // 15
    { favorable: false }, // 16
    { favorable: true }, // 17
    { favorable: false }, // 18
    { favorable: true }, // 19
    { favorable: false }, // 20
    { favorable: true }, // 21
    { favorable: false }, // 22
    { favorable: true }, // 23
    { favorable: false }, // 24
    { favorable: true }, // 25
    { favorable: false }, // 26
    { favorable: true }, // 27
    { favorable: false }, // 28
    { favorable: true }, // 29
    { favorable: false }, // 30
    { favorable: true }, // 31
    { favorable: false }, // 32
    { favorable: true }, // 33
    { favorable: false }, // 34
    { favorable: true }, // 35
    { favorable: false }, // 36
  ];

  const test6StartIndex = 12 + 28; // Test 4 (12) + Test 5 (28)
  const likertLabels = [
    "Gak Juga",
    "Agak Gak",
    "Netral",
    "Agak Iya",
    "Iya Lagi",
  ];

  // Add Test 6 options
  test6Questions.forEach((question, questionIndex) => {
    const testQuestion = testQuestionData[test6StartIndex + questionIndex];
    if (!testQuestion || !testQuestion.id) return;
    for (let i = 0; i < 5; i++) {
      const scoreValue = question.favorable ? i + 1 : 5 - i;
      options.push({
        id: randomUUIDv7(),
        text: likertLabels[i],
        value: scoreValue.toString(),
        order: i,
        testQuestionId: testQuestion.id,
      });
    }
  });

  return options;
}

export const data: TestQuestionOption[] = generateData();

export default async function seed(tx: Transaction) {
  await tx.insert(testQuestionOption).values(data);
}
