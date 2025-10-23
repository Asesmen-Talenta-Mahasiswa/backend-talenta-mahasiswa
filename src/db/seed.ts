import { fakerID_ID as faker } from "@faker-js/faker";
import { NewStudentModel } from "../feature/student/model";
import { buildConflictUpdateColumns, objectValues } from "../utils";
import {
  CareerCategory,
  Degree,
  Faculty,
  PermissionLevel,
  Program,
  QuestionType,
} from "../common/enum";
import db from ".";
import { schema } from "./schema";
import { DatabaseService } from "./service";
import { NewUserModel } from "../feature/user/model";
import {
  NewTestInstructionModel,
  NewTestModel,
  NewTestNoteModel,
} from "../feature/test/model";
import { NewOptionModel, NewQuestionModel } from "../feature/test/model";
import { inArray, sql } from "drizzle-orm";
import { SubmissionStatus } from "../common/enum";

export async function seedStudent() {
  const makePool = (concurrency: number) => {
    let active = 0;
    const queue: (() => void)[] = [];
    return async function <T>(fn: () => Promise<T>): Promise<T> {
      if (active >= concurrency) {
        await new Promise<void>((res) => queue.push(res));
      }
      active++;
      try {
        return await fn();
      } finally {
        active--;
        const next = queue.shift();
        if (next) next();
      }
    };
  };

  const degreeVals = objectValues(Degree);
  const facultyVals = objectValues(Faculty);
  const programVals = objectValues(Program);

  const prefixNPM = "25";
  const totalFakeStudents = 100_000;
  const PG_PARAM_LIMIT = 65_535;
  const totalInsertColumn = 6;
  const maxDbPoolSize = 15;

  const maxRowsPerQuery = Math.floor(PG_PARAM_LIMIT / totalInsertColumn);

  const batchSize = Math.min(8000, maxRowsPerQuery); // tune 2000-5000 depending on row width
  const concurrency = Math.min(8, maxDbPoolSize - 2); // tune to your DB connection pool (2-8)

  const fakeStudents = faker.helpers
    .uniqueArray(
      () => faker.string.numeric({ allowLeadingZeros: true, length: 8 }),
      totalFakeStudents
    )
    .map(
      (npm): NewStudentModel => ({
        npm: prefixNPM + npm,
        name: faker.person.fullName(),
        year: faker.helpers.arrayElement([2024, 2025, 2026]),
        degree: faker.helpers.arrayElement(degreeVals),
        faculty: faker.helpers.arrayElement(facultyVals),
        program: faker.helpers.arrayElement(programVals),
      })
    );

  const pool = makePool(concurrency);

  const updateConflictColumn = buildConflictUpdateColumns(schema.studentsTable, [
    "npm",
    "name",
  ]);

  // create batches
  const batches: NewStudentModel[][] = [];
  for (let i = 0; i < fakeStudents.length; i += batchSize) {
    batches.push(fakeStudents.slice(i, i + batchSize));
  }

  try {
    // We'll use per-batch inserts with limited concurrency:
    await Promise.all(
      batches.map((batch) =>
        pool(async () => {
          // each batch in its own transaction (optional)
          // return db.transaction(async (tx) => {
          return db
            .insert(schema.studentsTable)
            .values(batch)
            .onConflictDoUpdate({
              target: schema.studentsTable.npm,
              set: {
                ...updateConflictColumn,
                updatedAt: sql`now()`,
              },
            });
          // });
        })
      )
    );
    return true;
  } catch (error) {
    DatabaseService.logDatabaseError(error);
    return false;
  }
}

export async function seedUser() {
  const permissionlevelVals = objectValues(PermissionLevel);
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UNDERSCORE = "_";

  const defaultPassword = await Bun.password.hash("password123");
  const totalFakeUsers = 10;

  const fakeUsers = faker.helpers
    .uniqueArray(
      () => faker.string.fromCharacters(UPPER + LOWER + UNDERSCORE, 10),
      totalFakeUsers
    )
    .map(
      (username): NewUserModel => ({
        username,
        password: defaultPassword,
        permissionLevel: faker.helpers.arrayElement(permissionlevelVals),
      })
    );

  const updateConflictColumn = buildConflictUpdateColumns(schema.usersTable, [
    "username",
    "password",
    "permissionLevel",
  ]);

  try {
    await db
      .insert(schema.usersTable)
      .values(fakeUsers)
      .onConflictDoUpdate({
        target: schema.usersTable.username,
        set: {
          ...updateConflictColumn,
          updatedAt: sql`now()`,
        },
      });
    return true;
  } catch (error) {
    DatabaseService.logDatabaseError(error);
    return false;
  }
}

export async function seedTest() {
  try {
    const result = await db.transaction(async (tx) => {
      const fakeParentTest: NewTestModel = {
        name: "Asesmen Talenta Mahasiswa",
        description:
          "Tes Asesmen Talenta Mahasiswa merupakan alat ukur yang dirancang untuk membantu mahasiswa mengenali potensi, kepribadian, serta arah pengembangan diri dan karier mereka. Melalui asesmen ini, mahasiswa akan memperoleh gambaran yang lebih komprehensif mengenai minat, karakteristik personal, dan pola perilaku yang memengaruhi cara mereka belajar, berinteraksi, serta mengambil keputusan dalam kehidupan akademik maupun profesional.",
      };

      const [asesmenTalentaMahasiswaTest] = await tx
        .insert(schema.testsTable)
        .values(fakeParentTest)
        .returning()
        .onConflictDoNothing();

      if (!asesmenTalentaMahasiswaTest) {
        tx.rollback();
        return false;
      }

      console.log("success inserting fake test");

      const fakeChildTest: NewTestModel[] = [
        {
          name: "Bidang Karir Ideal",
          description:
            "Asesmen pada bagian ini akan membantumu untuk mengetahui kecenderungan bidang karir yang ideal untuk kamu tekuni kelak, berdasarkan minat serta karakteristik diri. Terdapat 40 soal yang terbagi menjadi dua sub bagian. Cermati instruksi pada setiap sub. bagiannya ya. Selamat Mengerjakan!",
          parentId: asesmenTalentaMahasiswaTest.id,
        },
        {
          name: "Pola Perilaku",
          description:
            "Asesmen pada bagian ini bertujuan untuk mengetahui pola perilaku yang biasa kamu lakukan sehari - hari, apakah sudah mendukung pengembangan talentamu. Terdapat 36 pernyataan yang akan membantumu melakukan refleksi diri",
          parentId: asesmenTalentaMahasiswaTest.id,
        },
      ];

      const childTest = await tx
        .insert(schema.testsTable)
        .values(fakeChildTest)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake sub test");

      const bidangKarirIdealTest = childTest.find(
        (st) => st.name === "Bidang Karir Ideal"
      );
      const polaPerilakuIdTest = childTest.find((st) => st.name === "Pola Perilaku");

      if (!bidangKarirIdealTest || !polaPerilakuIdTest) {
        tx.rollback();
        return false;
      }

      const fakeSubChildTest: NewTestModel[] = [
        {
          name: "Minat Karir",
          description:
            "Mengukur kecenderungan dan ketertarikan individu terhadap berbagai bidang pekerjaan dan karier. Hasilnya membantu mahasiswa memahami bidang kerja yang paling sesuai dengan minat dan nilai pribadi, serta memberikan arah dalam merencanakan jalur karier masa depan.",
          parentId: bidangKarirIdealTest.id,
        },
        {
          name: "Karakteristik Diri",
          description:
            "Berdasarkan kerangka Myers-Briggs Type Indicator (MBTI), subtes ini menggali preferensi dasar dalam cara berpikir, berinteraksi, dan mengambil keputusan. Hasilnya menunjukkan tipe kepribadian mahasiswa, yang dapat menjadi panduan dalam mengenali kekuatan diri, potensi pengembangan, serta gaya kerja yang paling sesuai.",
          parentId: bidangKarirIdealTest.id,
        },
        {
          name: "Kesejahteraan Psikologis",
          description:
            "Tes Psychological Well-Being (PWB) merupakan alat asesmen yang dirancang untuk mengukur tingkat kesejahteraan psikologis individu. Tes ini membantu memahami sejauh mana seseorang merasa bahagia, berfungsi secara positif, dan mampu mengembangkan potensi dirinya dalam kehidupan sehari-hari.",
          parentId: polaPerilakuIdTest.id,
        },
      ];

      const subChildTest = await tx
        .insert(schema.testsTable)
        .values(fakeSubChildTest)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake sub sub test");

      const minatKarirTest = subChildTest.find((test) => test.name === "Minat Karir");
      const karakteristikDiriTest = subChildTest.find(
        (test) => test.name === "Karakteristik Diri"
      );
      const kesejahteraanPsikologisTest = subChildTest.find(
        (test) => test.name === "Kesejahteraan Psikologis"
      );

      if (!minatKarirTest || !karakteristikDiriTest || !kesejahteraanPsikologisTest) {
        tx.rollback();
        return false;
      }

      const fakeTestInstruction: NewTestInstructionModel[] = [
        {
          text: "Pilih 1 respon yang paling kamu sukai atau paling mungkin kamu lakukan dari 4 pilihan respon yang tersedia di setiap situasi.",
          testId: minatKarirTest.id,
          order: 0,
        },
        {
          text: "Tentukan pilihan yang paling sesuai dengan karakteristik dan kebiasaanmu dari 2 opsi jawaban yang tersedia di setiap situasi.",
          testId: karakteristikDiriTest.id,
          order: 0,
        },
        {
          text: "Cermati setiap pernyataan dan renungkan seberapa cocok pernyataan tersebut dengan kondisi dirimu saat ini.",
          testId: kesejahteraanPsikologisTest.id,
          order: 0,
        },
        {
          text: "Jika pernyataan sangat sesuai, pilih angka 5 (iya banget).",
          testId: kesejahteraanPsikologisTest.id,
          order: 1,
        },
        {
          text: "Jika pernyataan tidak sesuai, pilih angka 1 (nggak juga).",
          testId: kesejahteraanPsikologisTest.id,
          order: 2,
        },
        {
          text: "Pilih angka di antara 1-5 sesuai dengan tingkat kesesuaianmu.",
          testId: kesejahteraanPsikologisTest.id,
          order: 3,
        },
      ];

      const testInstruction = await tx
        .insert(schema.testInstructionsTable)
        .values(fakeTestInstruction)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake sub sub test instruction");

      const fakeTestNote: NewTestNoteModel[] = [
        {
          text: "Total terdapat 12 situasi yang akan kamu hadapi.",
          testId: minatKarirTest.id,
          order: 0,
        },
        {
          text: "Pilihlah respon yang paling “aku banget”.",
          testId: minatKarirTest.id,
          order: 1,
        },
        {
          text: "Semakin jujur jawabanmu, semakin akurat hasil yang akan kamu peroleh.",
          testId: minatKarirTest.id,
          order: 2,
        },
        {
          text: "Total terdapat 28 situasi yang akan kamu hadapi.",
          testId: karakteristikDiriTest.id,
          order: 0,
        },
        {
          text: "Jika merasa kedua pilihan kurang sesuai, tetap pilih salah satu yang paling mendekati dirimu.",
          testId: karakteristikDiriTest.id,
          order: 1,
        },
        {
          text: "Tidak ada jawaban benar atau salah, semua menggambarkan keunikanmu.",
          testId: karakteristikDiriTest.id,
          order: 2,
        },
      ];

      const testNote = await tx
        .insert(schema.testNotesTable)
        .values(fakeTestNote)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake sub sub test note");

      const minatKarirQuestions: NewQuestionModel[] = [
        {
          text: "Cara saya agar lebih mudah memahami materi kuliah adalah dengan…",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Jenis tugas kuliah yang menarik minat saya & membuat bersemangat mengerjakannya adalah…",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Saat  kerja kelompok, peran / bagian yang paling saya nikmati adalah…",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Saya suka teman belajar yang …",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Saat diminta membuat kelompok, saya akan memilih teman kelompok yang ..",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Peran yang paling saya nikmati saat presentasi adalah …",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Saat kelompok saya menghadapi kesulitan dalam mengerjakan tugas, yang biasanya saya lakukan.. ",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Saat membantu teman yang kesulitan belajar, saya biasanya…",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Saya tertarik untuk mengikuti kelas dengan karakteristik mengajar dosen yang …",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Kegiatan mahasiswa yang menarik minat saya …",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Saat punya waktu luang, saya lebih suka…",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
        {
          text: "Dalam 5 tahun kedepan, saya membayangkan akan menekuni jenis profesi …",
          type: QuestionType.SingleChoice,
          testId: minatKarirTest.id,
        },
      ];

      const createdMinatKarirQuestions = await tx
        .insert(schema.questionsTable)
        .values(minatKarirQuestions)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake minat karir questions");

      const minatKarirOptionsTexts: string[][] = [
        [
          "Membaca lalu membuat rangkuman yang mudah dibaca ulang.",
          "Mencari sumber informasi lain yang dapat membantu memahami materi tersebut",
          "Membuat diagram, mindmap atau catatan kreatif lainnya dengan warna dan gambar.",
          "Diskusi kelompok sambil memimpin pembicaraan agar semua memahami.",
        ],
        [
          "Tugas yang disertai dengan instruksi pengerjaan yang jelas.",
          "Tugas yang menantang saya untuk berpikir kritis dan mendalam.",
          "Tugas yang memberikan saya kebebasan untuk ide unik dan kreatif.",
          "Proyek kelompok yang memberi kesempatan saya mengatur strategi dan memandu kelompok",
        ],
        [
          "Menangani bagian teknis, seperti merapikan makalah atau bahan presentasi",
          "Mengumpulkan informasi dan data serta mengkonsep cara pengerjaan tugas",
          "Mencari ide-ide segar agar tugas lebih menarik dan unik.",
          "Mengarahkan kelompok dan mengatur strategi pengerjaan tugas",
        ],
        [
          "Bisa membantu saya menyelesaikan tugas secara praktis dan cepat",
          "Bisa mengimbangi saya untuk berdiskusi serta menganalisis permasalah secara mendalam",
          "Bisa memahami manfaat dari ide - ide unik yang saya miliki",
          "Punya semangat tinggi, aktif, dan mampu memotivasi saya",
        ],
        [
          "Cekatan serta mampu untuk bekerja dengan sistematis & terstruktur",
          "Pintar mencari referensi lain atau tambahan data untuk memperkuat tugas.",
          "Asik diajak berdiskusi untuk mengembangkan ide baru, tidak “anti” dengan ide baru.",
          "Mudah memahami arahan yang saya berikan.",
        ],
        [
          "Menyusun slide dan mempersiapkan teknis presentasi",
          "Mengumpulkan teori/literatur untuk isi presentasi",
          "Mengkreasikan tampilan slide presentasi agar lebih estetik & mudah dipahami.",
          "Mengkoordinir & memoderatori/memimpin jalannya presentasi",
        ],
        [
          "Memberikan saran praktis yang bisa langsung di terapkan",
          "Menganalisis apa yang menjadi sumber dari kesulitan yang ada",
          "Merenung memikirkan ide kreatif untuk menghadapi kesulitan tersebut.",
          "Memotivasi teman - teman lain agar tetap bersemangat meskipun ada kesulitan.",
        ],
        [
          "Menjelaskan materi dengan cara yang mudah dan praktis.",
          "Memberi pemahaman mendalam dengan konsep dan teori.",
          "Menjelaskan dengan cara  menarik, seperti gambar atau contoh yang unik",
          "Membuat strategi belajar bersama dan memotivasinya untuk mencoba.",
        ],
        [
          "Memberikan contoh nyata dan langsung menunjukkan cara penerapannya.",
          "Mengajak berpikir kritis dengan teori dan kajian yang mendalam.",
          "Memberikan materi pelajaran & tugas yang mendorong mahasiswa untuk berpikir kreatif",
          "Menciptakan suasana kompetisi di kelas",
        ],
        [
          "Komunitas yang fokus pada keterampilan teknis, seperti klub olahraga atau laboratorium.",
          "Komunitas akademik seperti kelompok riset atau diskusi ilmiah.",
          "Komunitas yang menekankan seni, kreativitas, atau desain.",
          "Komunitas wirausaha atau organisasi kepemimpinan.",
        ],
        [
          "Beraktivitas yang tidak terlalu banyak menyita pikiran serta langsung terlihat hasilnya seperti olahraga atau masak.",
          "Mengasah pikiran dengan membaca buku atau menonton video edukatif.",
          "Membuat karya / project pribadi seperti menggambar, menulis, atau editing video.",
          "Merencanakan ide proyek atau usaha kecil-kecilan.",
        ],
        [
          "Praktisi : profesi  yang menerapkan ilmu secara praktis",
          "Akademisi : profesi yang meneliti & mengembangkan ilmu",
          "Pekerja kreatif : profesi yang membuat menciptakan berbagai produk & karya kreatif.",
          "Wirausaha : profesi yang membangun bisnis secara mandiri.",
        ],
      ];

      const minatKarirOptions: NewOptionModel[] = createdMinatKarirQuestions.flatMap(
        (q, idx) =>
          minatKarirOptionsTexts[idx].map((text, order) => ({
            text,
            value: objectValues(CareerCategory)[order],
            order,
            questionId: q.id,
          }))
      );

      const createdMinatKarirOptions = await tx
        .insert(schema.optionsTable)
        .values(minatKarirOptions)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake minat karir options");

      const karakteristikDiriQuestions: NewQuestionModel[] = [
        {
          text: "Ide akan lebih mudah datang jika:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Belajar akan lebih efektif di tempat yang suasananya:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Lebih bersemangat belajar di kelas yang suasananya:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Lebih mudah memahami materi pelajaran jika:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Lebih enak mengulang pelajaran dengan cara:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Lebih bersemangat jika mengerjakan tugas:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Waktu kosong terasa lebih menyenangkan jika digunakan untuk:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Cara saya mempersiapkan bahan presentasi:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Cara saya mencatat penjelasan dosen:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Belajar akan lebih seru jika:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Kontribusi saya dalam tugas kelompok biasanya:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Saat membuat catatan mandiri, saya lebih sering:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Topik diskusi yang membuat saya bersemangat:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Materi kuliah akan lebih mudah saya pahami jika:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Jika terdapat perbedaan pendapat saat berdiskusi, saya lebih memilih:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Jika diminta untuk menilai presentasi kelompok lain, saya lebih memperhatikan:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Menurut saya bantuan terbaik untuk teman yang sulit memahami pelajaran adalah:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Jika dalam kelompok ada teman yang kurang berkontribusi, yang akan saya lakukan:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Dalam kelompok belajar, yang paling penting buat saya:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Dalam memilih teman dekat, saya lebih tertarik pada:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Saat teman curhat, saya akan:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Pola saya menulis makalah:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Jika ada beberapa tugas dalam waktu bersamaan, saya biasanya",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Dalam mengatur kegiatan sehari-hari, saya lebih suka:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Saya lebih suka alur diskusi yang:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Saat ada janjian mengerjakan tugas kelompok:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Cara saya mempersiapkan diri saat menjadi presenter:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
        {
          text: "Saat mengulang membaca materi kuliah:",
          type: QuestionType.SingleChoice,
          testId: karakteristikDiriTest.id,
        },
      ];

      const createdKarakteristikDiriQuestions = await tx
        .insert(schema.questionsTable)
        .values(karakteristikDiriQuestions)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake karakteristik diri questions");

      const karakteristikDiriOptionsTexts: string[][] = [
        ["Berdiskusi", "Merenung sendiri"],
        ["Ramai & bersemangat", "Sunyi & menenangkan"],
        ["Aktif & interaktif", "Tenang & teratur"],
        [
          "Aktif mengikuti diskusi & tanya jawab di kelas",
          "Mendengarkan, membaca & mencatat sendiri",
        ],
        ["Diskusi & tanya jawab dengan teman", "Membaca ulang catatan sendiri"],
        ["Tugas kelompok", "Tugas individu"],
        ["Jalan - jalan bersama teman - teman", "Santai di rumah sendirian"],
        [
          "Menyusun poin - poin yang jelas & terstruktur",
          "Mengembangkan presentasi dengan alur yang unik & kreatif",
        ],
        [
          "Sesuai dengan kata - kata yang digunakan dosen",
          "Meringkas dengan bahasa saya sendiri",
        ],
        [
          "Melakukan praktik nyata & simulasi langsung",
          "Diminta mengembangkan ide baru yang kreatif",
        ],
        [
          "Menyumbang data, informasi, sumber referensi",
          "Ide kreatif tentang cara mengerjakan tugas",
        ],
        [
          "Menyalin ulang detail dari buku/catatan",
          "Membuat diagram / ilustrasi untuk menangkap ide utamanya",
        ],
        [
          "Tips - tips praktis yang bisa langsung diterapkan",
          "Ide - ide besar yang inspiratif",
        ],
        [
          "Dosen memberi contoh nyata dan praktis",
          "Dosen memberi analogi - analogi kreatif",
        ],
        [
          "Mempertahankan argumen yang saya yakini benar",
          "Menjaga agar suasana tetap harmonis",
        ],
        ["Kualitas struktur logika & isi materi", "Usaha, semangat & kerjasama kelompok"],
        [
          "Menjelaskan materi dengan sistematis & rasional agar dia mudah memahami",
          "Memberikan dorongan & semangat agar dia mau terus mencoba",
        ],
        [
          "Mengingatkan bagian tugas yang menjadi tanggung jawabnya serta batas waktu pengerjaan tugas",
          "Mengajak berdiskusi untuk memahami alasan mengapa ia kurang berkontribusi",
        ],
        [
          "Efisiensi kerja supaya cepat selesai",
          "Kebersamaan agar semua merasa dihargai",
        ],
        [
          "Orang yang berpikir logis, kritis dan konsisten",
          "Orang yang peduli dan bisa memahami perasaan saya",
        ],
        [
          "Memberikan solusi praktis yang bisa langsung diterapkan",
          "Memberikan semangat & dukungan emosi",
        ],
        [
          "Membuat outline terstruktur sebelum menulis",
          "Menulis ide yang muncul dulu, lalu merapikan belakangan",
        ],
        [
          "Menyusun strategi dan jadwal pengerjaan tugas dengan teratur",
          "Mengerjakan secara fleksibel sesuai mana yang terasa mudah dulu",
        ],
        [
          "Kegiatan dengan rutinitas yang cenderung terjawal",
          "Jadwal kegiatan yang cenderung fleksibel sesuai kondisi harian",
        ],
        ["Alur serta poin - poin pembahasannya jelas", "Mengalir bebas saja"],
        [
          "Mencoba mencari informasi dan mempersiapkan materi tugas sebelum bertemu teman kelompok",
          "Mulai bekerja setelah bertemu dengan teman kelompok",
        ],
        [
          "Merencanakan kalimat yang akan disampaikan dengan detail setiap slidenya",
          "Mempersiapkan beberapa kalimat kunci & mengembangkannya saat presentasi",
        ],
        [
          "Membaca sesuai dengan urutan bab buku / artikel",
          "Membaca acak sesuai dengan keinginan",
        ],
      ];

      // MBTI value mapping based on question ranges
      // Questions 1-7: E/I
      // Questions 8-14: S/N
      // Questions 15-21: T/F
      // Questions 22-28: J/P
      const getMBTIValue = (questionIndex: number, optionIndex: number): string => {
        if (questionIndex < 7) {
          // Questions 1-7: Option A = E, Option B = I
          return optionIndex === 0 ? "E" : "I";
        } else if (questionIndex < 14) {
          // Questions 8-14: Option A = S, Option B = N
          return optionIndex === 0 ? "S" : "N";
        } else if (questionIndex < 21) {
          // Questions 15-21: Option A = T, Option B = F
          return optionIndex === 0 ? "T" : "F";
        } else {
          // Questions 22-28: Option A = J, Option B = P
          return optionIndex === 0 ? "J" : "P";
        }
      };

      const karakteristikDiriOptions: NewOptionModel[] =
        createdKarakteristikDiriQuestions.flatMap((q, questionIdx) =>
          karakteristikDiriOptionsTexts[questionIdx].map((text, optionIdx) => ({
            text,
            value: getMBTIValue(questionIdx, optionIdx),
            order: optionIdx,
            questionId: q.id,
          }))
        );

      const createdKarakteristikDiriOptions = await tx
        .insert(schema.optionsTable)
        .values(karakteristikDiriOptions)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake karakteristik diri options");

      const kesejahteraanPsikologisQuestions: NewQuestionModel[] = [
        // SELF ACCEPTANCE - Favorable
        {
          text: "Secara umum, saya merasa puas dengan kualitas diri saya saat ini",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // SELF ACCEPTANCE - Unfavorable
        {
          text: "Saya sering menginginkan kehidupan seperti orang yang terlihat lebih beruntung.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // SELF ACCEPTANCE - Favorable
        {
          text: "Saya mampu menerima kekurangan saya tanpa harus membenci diri sendiri",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // SELF ACCEPTANCE - Unfavorable
        {
          text: "Ada hal-hal dalam diri saya yang membuat saya terus merasa insecure (rendah diri)",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // SELF ACCEPTANCE - Favorable
        {
          text: "Saya sudah mampu berdamai dengan hampir semua pengalaman buruk di masa lalu",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // SELF ACCEPTANCE - Unfavorable
        {
          text: "Masih banyak kejadian di masa lalu yang ingin saya ubah karena membuat saya kecewa saat mengingatnya",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // AUTONOMY - Favorable
        {
          text: "Saya punya cara sendiri dalam menentukan apa yang penting bagi hidup saya.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // AUTONOMY - Unfavorable
        {
          text: "Saya gampang overthinking (berpikir berlebihan) setelah mendapat penilaian negatif dari orang lain.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // AUTONOMY - Favorable
        {
          text: "Saya berani memilih keputusan meski berbeda dari kebanyakan orang",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // AUTONOMY - Unfavorable
        {
          text: "Seringkali saya mengikuti apa kata orang meskipun tidak sesuai dengan keinginan saya",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // AUTONOMY - Favorable
        {
          text: "Saya akan tetap berkata jujur meskipun tidak sesuai dengan harapan orang lain",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // AUTONOMY - Unfavorable
        {
          text: "Seringkali saya menyesuaikan perilaku agar bisa diterima di lingkungan sosial",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PURPOSE IN LIFE - Favorable
        {
          text: "Saya sudah memiliki rencana dengan langkah yang jelas untuk mencapai cita - cita di masa depan",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PURPOSE IN LIFE - Unfavorable
        {
          text: "Saat ini saya tidak tahu dengan pasti apa yang ingin saya capai di masa depan",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PURPOSE IN LIFE - Favorable
        {
          text: "Saya berani memilih keputusan meski berbeda dari kebanyakan orang",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PURPOSE IN LIFE - Unfavorable
        {
          text: "Rasanya tidak banyak momen berharga dari perjalanan hidup yang telah saya lalu",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PURPOSE IN LIFE - Favorable
        {
          text: "Optimis dan yakin, bahwa di masa depan saya akan menjadi pribadi yang berguna bagi banyak orang.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PURPOSE IN LIFE - Unfavorable
        {
          text: "Jika melihat kondisi diri saat ini, rasanya di masa depan saya akan kesulitan untuk bisa sukses.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PERSONAL GROWTH - Favorable
        {
          text: "Saya merasakan banyak perubahan positif pada diri saya dalam 1 tahun terakhir",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PERSONAL GROWTH - Unfavorable
        {
          text: "Beberapa kebiasaan buruk masih menghambat saya untuk berkembang",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PERSONAL GROWTH - Favorable
        {
          text: "Saya rutin melakukan evaluasi & refleksi diri, untuk semakin memahami bakat serta potensi yang dimilik",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PERSONAL GROWTH - Unfavorable
        {
          text: "Saya belum menyadari apa saja potensi diri yang perlu saya kembangkan",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PERSONAL GROWTH - Favorable
        {
          text: "Saya senang mencari tantangan dengan mencoba berbagai pengalaman baru",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // PERSONAL GROWTH - Unfavorable
        {
          text: "Seringkali saya menghindar untuk mencoba hal - hal baru, karena takut gagal.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // ENVIRONMENTAL MASTERY - Favorable
        {
          text: "Saya mampu menata lingkungan agar mememberikan suasana yang kondusif untuk saya belajar.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // ENVIRONMENTAL MASTERY - Unfavorable
        {
          text: "Seringkali saya merasa kewalahan untuk menghadapi tuntutan lingkungan kepada saya",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // ENVIRONMENTAL MASTERY - Favorable
        {
          text: "Saya mampu menyelesaikan semua tanggung jawab sehari - hari tanpa merasa kewalahan.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // ENVIRONMENTAL MASTERY - Unfavorable
        {
          text: "Seringkali saya merasa memiliki terlalu banyak kegiatan, sehingga sulit mengaturnya",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // ENVIRONMENTAL MASTERY - Favorable
        {
          text: "Saya termasuk orang yang jeli menemukan peluang dan kesempatan yang ada disekitar",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // ENVIRONMENTAL MASTERY - Unfavorable
        {
          text: "Seringkali saya terlambat menyadari jika ternyata di sekitar saya terdapat banyak kesempatan & peluang baik",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Favorable
        {
          text: "Saya memiliki beberapa teman yang benar - benar dipercaya untuk menyimpan rahasia.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Unfavorable
        {
          text: "Rasanya orang - orang di sekitar saya tidak benar - benar bisa memahami saya",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Favorable
        {
          text: "Saya merasa mampu dan nyaman untuk menunjukkan perhatian secara langsung kepada orang lain.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Unfavorable
        {
          text: "Seringkali saya menjadi orang yang diabaikan di lingkaran pertemanan",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Favorable
        {
          text: "Mudah bagi saya untuk meredam ego dan mengalah agar perdebatan tidak berlaut - larut.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Unfavorable
        {
          text: "Seringkali kesabaran saya berkurang saat menghadapi orang yang pemikirannya tidak sejalan dengan saya.",
          type: QuestionType.Likert,
          testId: kesejahteraanPsikologisTest.id,
        },
      ];

      const createdKesejahteraanPsikologisQuestions = await tx
        .insert(schema.questionsTable)
        .values(kesejahteraanPsikologisQuestions)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake kesejahteraan psikologis questions");

      // Define which questions are unfavorable (reversed scoring)
      // Unfavorable questions are at odd indices (1, 3, 5, 7, etc.) - every second question
      const unfavorableQuestions = [
        1,
        3,
        5, // SELF ACCEPTANCE unfavorable
        7,
        9,
        11, // AUTONOMY unfavorable
        13,
        15,
        17, // PURPOSE IN LIFE unfavorable
        19,
        21,
        23, // PERSONAL GROWTH unfavorable
        25,
        27,
        29, // ENVIRONMENTAL MASTERY unfavorable
        31,
        33,
        35, // POSITIVE RELATIONSHIP WITH OTHERS unfavorable
      ];

      // Create Likert scale options for each question
      const kesejahteraanPsikologisOptions: NewOptionModel[] =
        createdKesejahteraanPsikologisQuestions.flatMap((q, questionIdx) => {
          const isUnfavorable = unfavorableQuestions.includes(questionIdx);

          return [
            {
              text: "Gak juga",
              value: isUnfavorable ? "5" : "1",
              order: 0,
              questionId: q.id,
            },
            {
              text: "",
              value: isUnfavorable ? "4" : "2",
              order: 1,
              questionId: q.id,
            },
            {
              text: "",
              value: "3",
              order: 2,
              questionId: q.id,
            },
            {
              text: "",
              value: isUnfavorable ? "2" : "4",
              order: 3,
              questionId: q.id,
            },
            {
              text: "Iya banget",
              value: isUnfavorable ? "1" : "5",
              order: 4,
              questionId: q.id,
            },
          ];
        });

      const createdKesejahteraanPsikologisOptions = await tx
        .insert(schema.optionsTable)
        .values(kesejahteraanPsikologisOptions)
        .returning()
        .onConflictDoNothing();

      console.log("success inserting fake kesejahteraan psikologis options");
      return true;
    });

    return result;
  } catch (error) {
    DatabaseService.logDatabaseError(error);
    return false;
  }
}

export async function seedResult() {
  try {
    // 1) Load required tests by name to get their IDs
    const allTests = await db.select().from(schema.testsTable);

    const getTestByName = (name: string) => allTests.find((t) => t.name === name);

    const parentTest = getTestByName("Asesmen Talenta Mahasiswa");
    const bidangKarirIdealTest = getTestByName("Bidang Karir Ideal");
    const polaPerilakuTest = getTestByName("Pola Perilaku");
    const minatKarirTest = getTestByName("Minat Karir");
    const karakteristikDiriTest = getTestByName("Karakteristik Diri");
    const kesejahteraanPsikologisTest = getTestByName("Kesejahteraan Psikologis");

    if (
      !parentTest ||
      !bidangKarirIdealTest ||
      !polaPerilakuTest ||
      !minatKarirTest ||
      !karakteristikDiriTest ||
      !kesejahteraanPsikologisTest
    ) {
      console.error("Required tests are missing. Please run seedTest() first.");
      return false;
    }

    // 2) Load questions and options for leaf tests
    const leafTestIds = [
      minatKarirTest.id,
      karakteristikDiriTest.id,
      kesejahteraanPsikologisTest.id,
    ];

    const leafQuestions = await db
      .select()
      .from(schema.questionsTable)
      .where(inArray(schema.questionsTable.testId, leafTestIds));

    const questionIds = leafQuestions.map((q) => q.id);
    const allOptions = await db
      .select()
      .from(schema.optionsTable)
      .where(inArray(schema.optionsTable.questionId, questionIds));

    const optionsByQuestionId = new Map<string, typeof allOptions>();
    for (const opt of allOptions) {
      const list = optionsByQuestionId.get(opt.questionId) ?? [];
      list.push(opt);
      optionsByQuestionId.set(opt.questionId, list);
    }

    const questionsByTestId = new Map<number, typeof leafQuestions>();
    for (const q of leafQuestions) {
      const list = questionsByTestId.get(q.testId) ?? [];
      list.push(q);
      questionsByTestId.set(q.testId, list);
    }

    // 3) Pick 1000 students
    const students = await db.select().from(schema.studentsTable).limit(1000);
    if (students.length === 0) {
      console.error("No students found. Please run seedStudent() first.");
      return false;
    }

    // Choose 15% as in-progress (no answers/results), rest completed
    const inProgressCount = Math.floor(students.length * 0.15);
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const inProgressIds = new Set<string>(
      shuffled.slice(0, inProgressCount).map((s) => s.id)
    );

    // Helper: random pick
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // Helper: compute MBTI from selected values
    const computeMbti = (values: string[]): string => {
      let E = 0,
        I = 0,
        S = 0,
        N = 0,
        T = 0,
        F = 0,
        J = 0,
        P = 0;
      for (const v of values) {
        if (v === "E") E++;
        else if (v === "I") I++;
        else if (v === "S") S++;
        else if (v === "N") N++;
        else if (v === "T") T++;
        else if (v === "F") F++;
        else if (v === "J") J++;
        else if (v === "P") P++;
      }
      const letter = (a: number, b: number, A: string, B: string) =>
        a === b ? (Math.random() < 0.5 ? A : B) : a > b ? A : B;
      return (
        letter(E, I, "E", "I") +
        letter(S, N, "S", "N") +
        letter(T, F, "T", "F") +
        letter(J, P, "J", "P")
      );
    };

    // Helper: map MBTI to dominant/secondary CareerCategory
    const mbtiToCareer = (mbti: string): { dominan: string; sekunder: string } => {
      // Simple heuristic mapping based on the first two letters
      const first = mbti[0];
      const second = mbti[1];
      // Dominant
      let dominan: string;
      if (second === "S" && (first === "E" || first === "I")) {
        // Sensing types lean to practical, hands-on
        dominan = CareerCategory.Praktisi;
      } else if (second === "N") {
        // Intuitive types split by T/F
        dominan =
          mbti[2] === "T" ? CareerCategory.Akademisi : CareerCategory.PekerjaKreatif;
      } else {
        dominan = CareerCategory.Wirausaha;
      }
      // Secondary
      let sekunder: string;
      switch (dominan) {
        case CareerCategory.Praktisi:
          sekunder = CareerCategory.Wirausaha;
          break;
        case CareerCategory.Akademisi:
          sekunder = CareerCategory.Praktisi;
          break;
        case CareerCategory.PekerjaKreatif:
          sekunder = CareerCategory.Wirausaha;
          break;
        default:
          sekunder = CareerCategory.PekerjaKreatif;
      }
      return { dominan, sekunder };
    };

    const bidangKarirCompatibility = (
      minat: string,
      mbti: string
    ): "sangat_sesuai" | "cukup_sesuai" | "tidak_sesuai" => {
      const { dominan, sekunder } = mbtiToCareer(mbti);
      if (minat === dominan) return "sangat_sesuai";
      if (minat === sekunder) return "cukup_sesuai";
      return "tidak_sesuai";
    };

    const polaPerilakuLevel = (
      pwbScore: number
    ): "tidak_siap" | "cukup_siap" | "sangat_siap" => {
      if (pwbScore <= 60) return "tidak_siap";
      if (pwbScore <= 120) return "cukup_siap";
      return "sangat_siap";
    };

    const nineBox = (
      bidang: "sangat_sesuai" | "cukup_sesuai" | "tidak_sesuai",
      pola: "tidak_siap" | "cukup_siap" | "sangat_siap"
    ) => {
      if (bidang === "tidak_sesuai" && pola === "tidak_siap") return "critical_mismatch";
      if (bidang === "tidak_sesuai" && pola === "cukup_siap")
        return "inconsistent_fit_zone";
      if (bidang === "tidak_sesuai" && pola === "sangat_siap")
        return "happy_but_misaligned";
      if (bidang === "cukup_sesuai" && pola === "tidak_siap")
        return "underdeveloped_potential";
      if (bidang === "cukup_sesuai" && pola === "cukup_siap") return "growth_zone";
      if (bidang === "cukup_sesuai" && pola === "sangat_siap")
        return "positive_explorers";
      if (bidang === "sangat_sesuai" && pola === "tidak_siap") return "latent_talent";
      if (bidang === "sangat_sesuai" && pola === "cukup_siap")
        return "aligned_developers";
      return "high-fit_champions";
    };

    // Batching to reduce memory/statement pressure
    const batchSize = 500;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      await db.transaction(async (tx) => {
        for (const student of batch) {
          const now = new Date();

          // Always create ONE submission for the parent test per student
          const [parentSubmission] = await tx
            .insert(schema.testSubmissionsTable)
            .values({
              studentId: student.id,
              testId: parentTest.id,
              status: inProgressIds.has(student.id)
                ? SubmissionStatus.InProgress
                : SubmissionStatus.Completed,
              createdAt: now,
              completedAt: inProgressIds.has(student.id) ? null : now,
            })
            .returning();

          // If in-progress, optionally create partial answers only; no results
          if (inProgressIds.has(student.id)) {
            const willAnswerSomething = Math.random() < 0.6; // 60% answer something
            if (!willAnswerSomething) continue;

            const answersToInsert: {
              submissionId: string;
              questionId: string;
              selectedOptionId: string;
            }[] = [];

            const maybeAnswerPartial = (
              testId: number,
              minRatio = 0.2,
              maxRatio = 0.6
            ) => {
              const qs = questionsByTestId.get(testId) ?? [];
              if (!qs.length) return;
              const started = Math.random() < 0.7;
              if (!started) return;
              const ratio = minRatio + Math.random() * (maxRatio - minRatio);
              const count = Math.max(1, Math.floor(qs.length * ratio));
              const indices = Array.from({ length: qs.length }, (_, i) => i)
                .sort(() => Math.random() - 0.5)
                .slice(0, count);
              for (const idx of indices) {
                const q = qs[idx];
                const opts = optionsByQuestionId.get(q.id) ?? [];
                if (!opts.length) continue;
                const chosen = opts[Math.floor(Math.random() * opts.length)];
                answersToInsert.push({
                  submissionId: parentSubmission.id,
                  questionId: q.id,
                  selectedOptionId: chosen.id,
                });
              }
            };

            // Try partial answers on each leaf test; ensure at least one question answered
            maybeAnswerPartial(minatKarirTest.id);
            maybeAnswerPartial(karakteristikDiriTest.id);
            maybeAnswerPartial(kesejahteraanPsikologisTest.id);

            if (answersToInsert.length === 0) {
              // Force answering at least 1 question from Minat Karir if none selected
              const qs = questionsByTestId.get(minatKarirTest.id) ?? [];
              if (qs.length) {
                const q = qs[Math.floor(Math.random() * qs.length)];
                const opts = optionsByQuestionId.get(q.id) ?? [];
                if (opts.length) {
                  const chosen = opts[Math.floor(Math.random() * opts.length)];
                  answersToInsert.push({
                    submissionId: parentSubmission.id,
                    questionId: q.id,
                    selectedOptionId: chosen.id,
                  });
                }
              }
            }

            if (answersToInsert.length) {
              await tx.insert(schema.studentAnswersTable).values(answersToInsert);
            }
            continue;
          }

          // Completed flow: answer all leaf tests, compute, and store all results under the SAME parent submission
          // Answer Minat Karir and compute category counts
          const minatQs = questionsByTestId.get(minatKarirTest.id) ?? [];
          const careerCounts: Record<string, number> = {
            [CareerCategory.Praktisi]: 0,
            [CareerCategory.Akademisi]: 0,
            [CareerCategory.PekerjaKreatif]: 0,
            [CareerCategory.Wirausaha]: 0,
          };
          const minatAnswers: {
            submissionId: string;
            questionId: string;
            selectedOptionId: string;
          }[] = [];
          for (const q of minatQs) {
            const opts = optionsByQuestionId.get(q.id) ?? [];
            const chosen = pick(opts);
            minatAnswers.push({
              submissionId: parentSubmission.id,
              questionId: q.id,
              selectedOptionId: chosen.id,
            });
            const v = chosen.value;
            if (v in careerCounts) careerCounts[v]++;
          }
          const minatDominantCategory = Object.entries(careerCounts).sort(
            (a, b) => b[1] - a[1]
          )[0][0];

          // Answer Karakteristik Diri and compute MBTI
          const karQs = questionsByTestId.get(karakteristikDiriTest.id) ?? [];
          const karValues: string[] = [];
          const karAnswers: {
            submissionId: string;
            questionId: string;
            selectedOptionId: string;
          }[] = [];
          for (const q of karQs) {
            const opts = optionsByQuestionId.get(q.id) ?? [];
            const chosen = pick(opts);
            karAnswers.push({
              submissionId: parentSubmission.id,
              questionId: q.id,
              selectedOptionId: chosen.id,
            });
            karValues.push(chosen.value);
          }
          const mbtiType = computeMbti(karValues);

          // Answer Kesejahteraan Psikologis and compute total score
          const pwbQs = questionsByTestId.get(kesejahteraanPsikologisTest.id) ?? [];
          let pwbSum = 0;
          const pwbAnswers: {
            submissionId: string;
            questionId: string;
            selectedOptionId: string;
          }[] = [];
          for (const q of pwbQs) {
            const opts = optionsByQuestionId.get(q.id) ?? [];
            const chosen = pick(opts);
            pwbAnswers.push({
              submissionId: parentSubmission.id,
              questionId: q.id,
              selectedOptionId: chosen.id,
            });
            const valNum = Number(chosen.value);
            pwbSum += Number.isFinite(valNum) ? valNum : 0;
          }

          // Insert all answers
          if (minatAnswers.length) {
            await tx.insert(schema.studentAnswersTable).values(minatAnswers);
          }
          if (karAnswers.length) {
            await tx.insert(schema.studentAnswersTable).values(karAnswers);
          }
          if (pwbAnswers.length) {
            await tx.insert(schema.studentAnswersTable).values(pwbAnswers);
          }

          // Compute derived results
          const bidangRes = bidangKarirCompatibility(minatDominantCategory, mbtiType);
          const polaRes = polaPerilakuLevel(pwbSum);
          const nineRes = nineBox(bidangRes, polaRes);

          // Insert ALL results (leaf, mid-level, and parent) to the SAME submissionId
          await tx.insert(schema.submissionResultsTable).values([
            {
              submissionId: parentSubmission.id,
              testId: minatKarirTest.id,
              resultValue: String(minatDominantCategory),
            },
            {
              submissionId: parentSubmission.id,
              testId: karakteristikDiriTest.id,
              resultValue: mbtiType,
            },
            {
              submissionId: parentSubmission.id,
              testId: kesejahteraanPsikologisTest.id,
              resultValue: String(pwbSum),
            },
            {
              submissionId: parentSubmission.id,
              testId: bidangKarirIdealTest.id,
              resultValue: bidangRes,
            },
            {
              submissionId: parentSubmission.id,
              testId: polaPerilakuTest.id,
              resultValue: polaRes,
            },
            {
              submissionId: parentSubmission.id,
              testId: parentTest.id,
              resultValue: nineRes,
            },
          ]);
        }
      });
    }

    console.log("success seeding 1000 submission results with answers");
    return true;
  } catch (error) {
    DatabaseService.logDatabaseError(error);
    return false;
  }
}
