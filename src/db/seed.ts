import { fakerID_ID as faker } from "@faker-js/faker";
import { NewStudentModel } from "../feature/student/model";
import { objectValues } from "../utils";
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
  NewSubTestInstructionModel,
  NewSubTestModel,
  NewSubTestNoteModel,
  NewTestModel,
} from "../feature/test/model";
import { NewOptionModel, NewQuestionModel } from "../feature/test/model";

export async function seedStudent() {
  const degreeVals = objectValues(Degree);
  const facultyVals = objectValues(Faculty);
  const programVals = objectValues(Program);

  const prefix = "25";

  const fakeStudents = faker.helpers
    .uniqueArray(
      () => faker.string.numeric({ allowLeadingZeros: true, length: 8 }),
      10
    )
    .map(
      (npm): NewStudentModel => ({
        npm: prefix + npm,
        name: faker.person.fullName(),
        degree: faker.helpers.arrayElement(degreeVals),
        faculty: faker.helpers.arrayElement(facultyVals),
        program: faker.helpers.arrayElement(programVals),
      })
    );

  try {
    await db.insert(schema.studentsTable).values(fakeStudents);
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

  const fakeUsers = faker.helpers
    .uniqueArray(
      () => faker.string.fromCharacters(UPPER + LOWER + UNDERSCORE, 10),
      10
    )
    .map(
      (username): NewUserModel => ({
        username,
        password: defaultPassword,
        permissionLevel: faker.helpers.arrayElement(permissionlevelVals),
      })
    );

  try {
    await db.insert(schema.usersTable).values(fakeUsers);
    return true;
  } catch (error) {
    DatabaseService.logDatabaseError(error);
    return false;
  }
}

export async function seedTest() {
  try {
    await db.transaction(async (tx) => {
      const fakeTest: NewTestModel = {
        name: "Asesmen Talenta Mahasiswa",
        description:
          "Tes Asesmen Talenta Mahasiswa merupakan alat ukur yang dirancang untuk membantu mahasiswa mengenali potensi, kepribadian, serta arah pengembangan diri dan karier mereka. Melalui asesmen ini, mahasiswa akan memperoleh gambaran yang lebih komprehensif mengenai minat, karakteristik personal, dan pola perilaku yang memengaruhi cara mereka belajar, berinteraksi, serta mengambil keputusan dalam kehidupan akademik maupun profesional.",
      };

      const [test] = await tx
        .insert(schema.testsTable)
        .values(fakeTest)
        .returning();

      if (!test) {
        tx.rollback();
      }

      console.log("success inserting fake test");

      const fakeSubTest: NewSubTestModel[] = [
        {
          name: "Bidang Karir Ideal",
          description:
            "Asesmen pada bagian ini akan membantumu untuk mengetahui kecenderungan bidang karir yang ideal untuk kamu tekuni kelak, berdasarkan minat serta karakteristik diri. Terdapat 40 soal yang terbagi menjadi dua sub bagian. Cermati instruksi pada setiap sub. bagiannya ya. Selamat Mengerjakan!",
          testId: test.id,
        },
        {
          name: "Pola Perilaku",
          description:
            "Asesmen pada bagian ini bertujuan untuk mengetahui pola perilaku yang biasa kamu lakukan sehari - hari, apakah sudah mendukung pengembangan talentamu. Terdapat 36 pernyataan yang akan membantumu melakukan refleksi diri",
          testId: test.id,
        },
      ];

      const subTest = await tx
        .insert(schema.subTestsTable)
        .values(fakeSubTest)
        .returning();

      if (subTest.length !== 2) {
        tx.rollback();
      }

      console.log("success inserting fake sub test");

      const bidangKarirIdealId =
        subTest.find((st) => st.name === "Bidang Karir Ideal")?.id ?? "";
      const polaPerilakuId =
        subTest.find((st) => st.name === "Pola Perilaku")?.id ?? "";

      const fakeSubSubTest: NewSubTestModel[] = [
        {
          name: "Minat Karir",
          description:
            "Mengukur kecenderungan dan ketertarikan individu terhadap berbagai bidang pekerjaan dan karier. Hasilnya membantu mahasiswa memahami bidang kerja yang paling sesuai dengan minat dan nilai pribadi, serta memberikan arah dalam merencanakan jalur karier masa depan.",
          testId: test.id,
          parentId: bidangKarirIdealId,
        },
        {
          name: "Karakteristik Diri",
          description:
            "Berdasarkan kerangka Myers-Briggs Type Indicator (MBTI), subtes ini menggali preferensi dasar dalam cara berpikir, berinteraksi, dan mengambil keputusan. Hasilnya menunjukkan tipe kepribadian mahasiswa, yang dapat menjadi panduan dalam mengenali kekuatan diri, potensi pengembangan, serta gaya kerja yang paling sesuai.",
          testId: test.id,
          parentId: bidangKarirIdealId,
        },
        {
          name: "Kesejahteraan Psikologis",
          description:
            "Tes Psychological Well-Being (PWB) merupakan alat asesmen yang dirancang untuk mengukur tingkat kesejahteraan psikologis individu. Tes ini membantu memahami sejauh mana seseorang merasa bahagia, berfungsi secara positif, dan mampu mengembangkan potensi dirinya dalam kehidupan sehari-hari.",
          testId: test.id,
          parentId: polaPerilakuId,
        },
      ];

      const subSubTest = await tx
        .insert(schema.subTestsTable)
        .values(fakeSubSubTest)
        .returning();

      if (subSubTest.length !== 3) {
        tx.rollback();
      }

      console.log("success inserting fake sub sub test");

      const minatKarirId =
        subSubTest.find((sst) => sst.name === "Minat Karir")?.id ?? "";
      const KarakteristikDiriId =
        subSubTest.find((sst) => sst.name === "Karakteristik Diri")?.id ?? "";
      const KesejahteraanPsikologiId =
        subSubTest.find((sst) => sst.name === "Kesejahteraan Psikologis")?.id ??
        "";

      const fakeSubSubTestInstruction: NewSubTestInstructionModel[] = [
        {
          text: "Pilih 1 respon yang paling kamu sukai atau paling mungkin kamu lakukan dari 4 pilihan respon yang tersedia di setiap situasi.",
          subtestId: minatKarirId,
          order: 0,
        },
        {
          text: "Tentukan pilihan yang paling sesuai dengan karakteristik dan kebiasaanmu dari 2 opsi jawaban yang tersedia di setiap situasi.",
          subtestId: KarakteristikDiriId,
          order: 0,
        },
        {
          text: "Cermati setiap pernyataan dan renungkan seberapa cocok pernyataan tersebut dengan kondisi dirimu saat ini.",
          subtestId: KesejahteraanPsikologiId,
          order: 0,
        },
        {
          text: "Jika pernyataan sangat sesuai, pilih angka 5 (iya banget).",
          subtestId: KesejahteraanPsikologiId,
          order: 1,
        },
        {
          text: "Jika pernyataan tidak sesuai, pilih angka 1 (nggak juga).",
          subtestId: KesejahteraanPsikologiId,
          order: 2,
        },
        {
          text: "Pilih angka di antara 1-5 sesuai dengan tingkat kesesuaianmu.",
          subtestId: KesejahteraanPsikologiId,
          order: 3,
        },
      ];

      const subSubTestInstruction = await tx
        .insert(schema.subtestInstructionsTable)
        .values(fakeSubSubTestInstruction)
        .returning();

      if (subSubTestInstruction.length !== 6) {
        tx.rollback();
      }

      console.log("success inserting fake sub sub test instruction");

      const fakeSubSubTestNote: NewSubTestNoteModel[] = [
        {
          text: "Total terdapat 12 situasi yang akan kamu hadapi.",
          subtestId: minatKarirId,
          order: 0,
        },
        {
          text: "Pilihlah respon yang paling “aku banget”.",
          subtestId: minatKarirId,
          order: 1,
        },
        {
          text: "Semakin jujur jawabanmu, semakin akurat hasil yang akan kamu peroleh.",
          subtestId: minatKarirId,
          order: 2,
        },
        {
          text: "Total terdapat 28 situasi yang akan kamu hadapi.",
          subtestId: KarakteristikDiriId,
          order: 0,
        },
        {
          text: "Jika merasa kedua pilihan kurang sesuai, tetap pilih salah satu yang paling mendekati dirimu.",
          subtestId: KarakteristikDiriId,
          order: 1,
        },
        {
          text: "Tidak ada jawaban benar atau salah, semua menggambarkan keunikanmu.",
          subtestId: KarakteristikDiriId,
          order: 2,
        },
      ];

      const subSubTestNote = await tx
        .insert(schema.subtestNotesTable)
        .values(fakeSubSubTestNote)
        .returning();

      if (subSubTestNote.length !== 6) {
        tx.rollback();
      }

      console.log("success inserting fake sub sub test note");

      // Insert questions and options for Sub-Sub Test: Minat Karir
      if (!minatKarirId) {
        tx.rollback();
      }

      const minatKarirQuestions: NewQuestionModel[] = [
        {
          text: "Cara saya agar lebih mudah memahami materi kuliah adalah dengan…",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Jenis tugas kuliah yang menarik minat saya & membuat bersemangat mengerjakannya adalah…",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Saat  kerja kelompok, peran / bagian yang paling saya nikmati adalah…",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Saya suka teman belajar yang …",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Saat diminta membuat kelompok, saya akan memilih teman kelompok yang ..",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Peran yang paling saya nikmati saat presentasi adalah …",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Saat kelompok saya menghadapi kesulitan dalam mengerjakan tugas, yang biasanya saya lakukan.. ",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Saat membantu teman yang kesulitan belajar, saya biasanya…",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Saya tertarik untuk mengikuti kelas dengan karakteristik mengajar dosen yang …",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Kegiatan mahasiswa yang menarik minat saya …",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Saat punya waktu luang, saya lebih suka…",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
        {
          text: "Dalam 5 tahun kedepan, saya membayangkan akan menekuni jenis profesi …",
          type: QuestionType.SingleChoice,
          subtestId: minatKarirId,
        },
      ];

      const createdMinatKarirQuestions = await tx
        .insert(schema.questionsTable)
        .values(minatKarirQuestions)
        .returning();

      if (createdMinatKarirQuestions.length !== 12) {
        tx.rollback();
      }

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

      const minatKarirOptions: NewOptionModel[] =
        createdMinatKarirQuestions.flatMap((q, idx) =>
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
        .returning();

      if (createdMinatKarirOptions.length !== 12 * 4) {
        tx.rollback();
      }

      console.log("success inserting fake minat karir options");

      // Insert questions and options for Sub-Sub Test: Karakteristik Diri
      if (!KarakteristikDiriId) {
        tx.rollback();
      }

      const karakteristikDiriQuestions: NewQuestionModel[] = [
        {
          text: "Ide akan lebih mudah datang jika:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Belajar akan lebih efektif di tempat yang suasananya:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Lebih bersemangat belajar di kelas yang suasananya:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Lebih mudah memahami materi pelajaran jika:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Lebih enak mengulang pelajaran dengan cara:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Lebih bersemangat jika mengerjakan tugas:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Waktu kosong terasa lebih menyenangkan jika digunakan untuk:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Cara saya mempersiapkan bahan presentasi:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Cara saya mencatat penjelasan dosen:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Belajar akan lebih seru jika:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Kontribusi saya dalam tugas kelompok biasanya:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Saat membuat catatan mandiri, saya lebih sering:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Topik diskusi yang membuat saya bersemangat:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Materi kuliah akan lebih mudah saya pahami jika:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Jika terdapat perbedaan pendapat saat berdiskusi, saya lebih memilih:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Jika diminta untuk menilai presentasi kelompok lain, saya lebih memperhatikan:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Menurut saya bantuan terbaik untuk teman yang sulit memahami pelajaran adalah:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Jika dalam kelompok ada teman yang kurang berkontribusi, yang akan saya lakukan:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Dalam kelompok belajar, yang paling penting buat saya:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Dalam memilih teman dekat, saya lebih tertarik pada:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Saat teman curhat, saya akan:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Pola saya menulis makalah:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Jika ada beberapa tugas dalam waktu bersamaan, saya biasanya",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Dalam mengatur kegiatan sehari-hari, saya lebih suka:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Saya lebih suka alur diskusi yang:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Saat ada janjian mengerjakan tugas kelompok:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Cara saya mempersiapkan diri saat menjadi presenter:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
        {
          text: "Saat mengulang membaca materi kuliah:",
          type: QuestionType.SingleChoice,
          subtestId: KarakteristikDiriId,
        },
      ];

      const createdKarakteristikDiriQuestions = await tx
        .insert(schema.questionsTable)
        .values(karakteristikDiriQuestions)
        .returning();

      if (createdKarakteristikDiriQuestions.length !== 28) {
        tx.rollback();
      }

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
        [
          "Kualitas struktur logika & isi materi",
          "Usaha, semangat & kerjasama kelompok",
        ],
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
      const getMBTIValue = (
        questionIndex: number,
        optionIndex: number
      ): string => {
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
        .returning();

      if (createdKarakteristikDiriOptions.length !== 28 * 2) {
        tx.rollback();
      }

      console.log("success inserting fake karakteristik diri options");

      // Insert questions and options for Sub-Sub Test: Kesejahteraan Psikologis
      if (!KesejahteraanPsikologiId) {
        tx.rollback();
      }

      const kesejahteraanPsikologisQuestions: NewQuestionModel[] = [
        // SELF ACCEPTANCE - Favorable
        {
          text: "Secara umum, saya merasa puas dengan kualitas diri saya saat ini",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // SELF ACCEPTANCE - Unfavorable
        {
          text: "Saya sering menginginkan kehidupan seperti orang yang terlihat lebih beruntung.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // SELF ACCEPTANCE - Favorable
        {
          text: "Saya mampu menerima kekurangan saya tanpa harus membenci diri sendiri",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // SELF ACCEPTANCE - Unfavorable
        {
          text: "Ada hal-hal dalam diri saya yang membuat saya terus merasa insecure (rendah diri)",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // SELF ACCEPTANCE - Favorable
        {
          text: "Saya sudah mampu berdamai dengan hampir semua pengalaman buruk di masa lalu",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // SELF ACCEPTANCE - Unfavorable
        {
          text: "Masih banyak kejadian di masa lalu yang ingin saya ubah karena membuat saya kecewa saat mengingatnya",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // AUTONOMY - Favorable
        {
          text: "Saya punya cara sendiri dalam menentukan apa yang penting bagi hidup saya.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // AUTONOMY - Unfavorable
        {
          text: "Saya gampang overthinking (berpikir berlebihan) setelah mendapat penilaian negatif dari orang lain.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // AUTONOMY - Favorable
        {
          text: "Saya berani memilih keputusan meski berbeda dari kebanyakan orang",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // AUTONOMY - Unfavorable
        {
          text: "Seringkali saya mengikuti apa kata orang meskipun tidak sesuai dengan keinginan saya",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // AUTONOMY - Favorable
        {
          text: "Saya akan tetap berkata jujur meskipun tidak sesuai dengan harapan orang lain",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // AUTONOMY - Unfavorable
        {
          text: "Seringkali saya menyesuaikan perilaku agar bisa diterima di lingkungan sosial",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PURPOSE IN LIFE - Favorable
        {
          text: "Saya sudah memiliki rencana dengan langkah yang jelas untuk mencapai cita - cita di masa depan",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PURPOSE IN LIFE - Unfavorable
        {
          text: "Saat ini saya tidak tahu dengan pasti apa yang ingin saya capai di masa depan",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PURPOSE IN LIFE - Favorable
        {
          text: "Saya berani memilih keputusan meski berbeda dari kebanyakan orang",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PURPOSE IN LIFE - Unfavorable
        {
          text: "Rasanya tidak banyak momen berharga dari perjalanan hidup yang telah saya lalu",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PURPOSE IN LIFE - Favorable
        {
          text: "Optimis dan yakin, bahwa di masa depan saya akan menjadi pribadi yang berguna bagi banyak orang.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PURPOSE IN LIFE - Unfavorable
        {
          text: "Jika melihat kondisi diri saat ini, rasanya di masa depan saya akan kesulitan untuk bisa sukses.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PERSONAL GROWTH - Favorable
        {
          text: "Saya merasakan banyak perubahan positif pada diri saya dalam 1 tahun terakhir",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PERSONAL GROWTH - Unfavorable
        {
          text: "Beberapa kebiasaan buruk masih menghambat saya untuk berkembang",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PERSONAL GROWTH - Favorable
        {
          text: "Saya rutin melakukan evaluasi & refleksi diri, untuk semakin memahami bakat serta potensi yang dimilik",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PERSONAL GROWTH - Unfavorable
        {
          text: "Saya belum menyadari apa saja potensi diri yang perlu saya kembangkan",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PERSONAL GROWTH - Favorable
        {
          text: "Saya senang mencari tantangan dengan mencoba berbagai pengalaman baru",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // PERSONAL GROWTH - Unfavorable
        {
          text: "Seringkali saya menghindar untuk mencoba hal - hal baru, karena takut gagal.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // ENVIRONMENTAL MASTERY - Favorable
        {
          text: "Saya mampu menata lingkungan agar mememberikan suasana yang kondusif untuk saya belajar.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // ENVIRONMENTAL MASTERY - Unfavorable
        {
          text: "Seringkali saya merasa kewalahan untuk menghadapi tuntutan lingkungan kepada saya",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // ENVIRONMENTAL MASTERY - Favorable
        {
          text: "Saya mampu menyelesaikan semua tanggung jawab sehari - hari tanpa merasa kewalahan.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // ENVIRONMENTAL MASTERY - Unfavorable
        {
          text: "Seringkali saya merasa memiliki terlalu banyak kegiatan, sehingga sulit mengaturnya",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // ENVIRONMENTAL MASTERY - Favorable
        {
          text: "Saya termasuk orang yang jeli menemukan peluang dan kesempatan yang ada disekitar",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // ENVIRONMENTAL MASTERY - Unfavorable
        {
          text: "Seringkali saya terlambat menyadari jika ternyata di sekitar saya terdapat banyak kesempatan & peluang baik",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Favorable
        {
          text: "Saya memiliki beberapa teman yang benar - benar dipercaya untuk menyimpan rahasia.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Unfavorable
        {
          text: "Rasanya orang - orang di sekitar saya tidak benar - benar bisa memahami saya",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Favorable
        {
          text: "Saya merasa mampu dan nyaman untuk menunjukkan perhatian secara langsung kepada orang lain.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Unfavorable
        {
          text: "Seringkali saya menjadi orang yang diabaikan di lingkaran pertemanan",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Favorable
        {
          text: "Mudah bagi saya untuk meredam ego dan mengalah agar perdebatan tidak berlaut - larut.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
        // POSITIVE RELATIONSHIP WITH OTHERS - Unfavorable
        {
          text: "Seringkali kesabaran saya berkurang saat menghadapi orang yang pemikirannya tidak sejalan dengan saya.",
          type: QuestionType.Likert,
          subtestId: KesejahteraanPsikologiId,
        },
      ];

      const createdKesejahteraanPsikologisQuestions = await tx
        .insert(schema.questionsTable)
        .values(kesejahteraanPsikologisQuestions)
        .returning();

      if (createdKesejahteraanPsikologisQuestions.length !== 36) {
        tx.rollback();
      }

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
        .returning();

      if (createdKesejahteraanPsikologisOptions.length !== 36 * 5) {
        tx.rollback();
      }

      console.log("success inserting fake kesejahteraan psikologis options");

      return true;
    });
    return true;
  } catch (error) {
    DatabaseService.logDatabaseError(error);
    return false;
  }
}

export async function seedResult() {
  try {
    // Get all students, tests, and related data
    const students = await db.select().from(schema.studentsTable);
    const tests = await db.select().from(schema.testsTable);
    const subTests = await db.select().from(schema.subTestsTable);
    const questions = await db.select().from(schema.questionsTable);
    const options = await db.select().from(schema.optionsTable);

    if (students.length === 0 || tests.length === 0) {
      console.log(
        "No students or tests found. Please seed students and tests first."
      );
      return false;
    }

    const test = tests[0]; // Use the first test

    // Create submissions for 5 students (completed) and 2 students (in progress)
    const completedStudents = students.slice(0, 5);
    const inProgressStudents = students.slice(5, 7);

    await db.transaction(async (tx) => {
      // Create completed submissions
      for (const student of completedStudents) {
        const [submission] = await tx
          .insert(schema.testSubmissionsTable)
          .values({
            studentId: student.id,
            testId: test.id,
            status: "completed",
            completedAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ), // Random time in last 7 days
          })
          .returning();

        console.log(
          `Created completed submission for student: ${student.name}`
        );

        // Create answers for all questions
        const studentAnswers = questions.map((question) => {
          // Get options for this question
          const questionOptions = options.filter(
            (opt) => opt.questionId === question.id
          );

          // Randomly select an option
          const selectedOption = faker.helpers.arrayElement(questionOptions);

          return {
            submissionId: submission.id,
            questionId: question.id,
            selectedOptionId: selectedOption.id,
          };
        });

        await tx.insert(schema.studentAnswersTable).values(studentAnswers);

        console.log(
          `Created ${studentAnswers.length} answers for submission ${submission.id}`
        );

        // Calculate and create results for each sub-test
        const minatKarirSubtest = subTests.find(
          (st) => st.name === "Minat Karir"
        );
        const karakteristikDiriSubtest = subTests.find(
          (st) => st.name === "Karakteristik Diri"
        );
        const kesejahteraanPsikologisSubtest = subTests.find(
          (st) => st.name === "Kesejahteraan Psikologis"
        );

        const results = [];

        // Minat Karir Result (Career Category)
        if (minatKarirSubtest) {
          const minatKarirQuestions = questions.filter(
            (q) => q.subtestId === minatKarirSubtest.id
          );
          const minatKarirAnswers = studentAnswers.filter((ans) =>
            minatKarirQuestions.some((q) => q.id === ans.questionId)
          );

          // Count career category occurrences
          const categoryCounts: Record<string, number> = {};
          for (const answer of minatKarirAnswers) {
            const option = options.find(
              (opt) => opt.id === answer.selectedOptionId
            );
            if (option && option.value) {
              categoryCounts[option.value] =
                (categoryCounts[option.value] || 0) + 1;
            }
          }

          // Find the most frequent category
          const dominantCategory =
            Object.entries(categoryCounts).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "Practitioner";

          results.push({
            submissionId: submission.id,
            subtestId: minatKarirSubtest.id,
            resultValue: dominantCategory,
          });
        }

        // Karakteristik Diri Result (MBTI)
        if (karakteristikDiriSubtest) {
          const karakteristikDiriQuestions = questions.filter(
            (q) => q.subtestId === karakteristikDiriSubtest.id
          );
          const karakteristikDiriAnswers = studentAnswers.filter((ans) =>
            karakteristikDiriQuestions.some((q) => q.id === ans.questionId)
          );

          // Count MBTI dimensions
          const dimensionCounts: Record<string, number> = {};
          for (const answer of karakteristikDiriAnswers) {
            const option = options.find(
              (opt) => opt.id === answer.selectedOptionId
            );
            if (option && option.value) {
              dimensionCounts[option.value] =
                (dimensionCounts[option.value] || 0) + 1;
            }
          }

          // Determine MBTI type
          const e = dimensionCounts["E"] || 0;
          const i = dimensionCounts["I"] || 0;
          const s = dimensionCounts["S"] || 0;
          const n = dimensionCounts["N"] || 0;
          const t = dimensionCounts["T"] || 0;
          const f = dimensionCounts["F"] || 0;
          const j = dimensionCounts["J"] || 0;
          const p = dimensionCounts["P"] || 0;

          const mbtiType = `${e >= i ? "E" : "I"}${s >= n ? "S" : "N"}${
            t >= f ? "T" : "F"
          }${j >= p ? "J" : "P"}`;

          results.push({
            submissionId: submission.id,
            subtestId: karakteristikDiriSubtest.id,
            resultValue: mbtiType,
          });
        }

        // Kesejahteraan Psikologis Result (PWB Score)
        let kesejahteraanScore = 0;
        if (kesejahteraanPsikologisSubtest) {
          const kesejahteraanQuestions = questions.filter(
            (q) => q.subtestId === kesejahteraanPsikologisSubtest.id
          );
          const kesejahteraanAnswers = studentAnswers.filter((ans) =>
            kesejahteraanQuestions.some((q) => q.id === ans.questionId)
          );

          // Calculate total score
          let totalScore = 0;
          for (const answer of kesejahteraanAnswers) {
            const option = options.find(
              (opt) => opt.id === answer.selectedOptionId
            );
            if (option && option.value) {
              totalScore += parseInt(option.value);
            }
          }

          kesejahteraanScore = totalScore;

          results.push({
            submissionId: submission.id,
            subtestId: kesejahteraanPsikologisSubtest.id,
            resultValue: totalScore.toString(),
          });
        }

        // Get parent subtests
        const bidangKarirIdealSubtest = subTests.find(
          (st) => st.name === "Bidang Karir Ideal"
        );
        const polaPerilakuSubtest = subTests.find(
          (st) => st.name === "Pola Perilaku"
        );

        // MBTI to Career Field mapping
        const mbtiToCareerMapping: Record<
          string,
          { dominant: string; secondary: string }
        > = {
          ISTJ: { dominant: "praktisi", secondary: "akademisi" },
          ISFJ: { dominant: "praktisi", secondary: "pekerja_kreatif" },
          INFJ: { dominant: "akademisi", secondary: "pekerja_kreatif" },
          INTJ: { dominant: "akademisi", secondary: "wirausaha" },
          ISTP: { dominant: "praktisi", secondary: "wirausaha" },
          ISFP: { dominant: "pekerja_kreatif", secondary: "praktisi" },
          INFP: { dominant: "pekerja_kreatif", secondary: "akademisi" },
          INTP: { dominant: "akademisi", secondary: "pekerja_kreatif" },
          ESTP: { dominant: "wirausaha", secondary: "praktisi" },
          ESFP: { dominant: "pekerja_kreatif", secondary: "wirausaha" },
          ENFP: { dominant: "pekerja_kreatif", secondary: "wirausaha" },
          ENTP: { dominant: "wirausaha", secondary: "pekerja_kreatif" },
          ESTJ: { dominant: "praktisi", secondary: "wirausaha" },
          ESFJ: { dominant: "praktisi", secondary: "pekerja_kreatif" },
          ENFJ: { dominant: "wirausaha", secondary: "akademisi" },
          ENTJ: { dominant: "wirausaha", secondary: "akademisi" },
        };

        // Calculate Bidang Karir Ideal Result
        let bidangKarirIdealResult = "tidak_sesuai";
        if (
          bidangKarirIdealSubtest &&
          minatKarirSubtest &&
          karakteristikDiriSubtest
        ) {
          const minatKarirResult = results.find(
            (r) => r.subtestId === minatKarirSubtest.id
          )?.resultValue;
          const karakteristikDiriResult = results.find(
            (r) => r.subtestId === karakteristikDiriSubtest.id
          )?.resultValue;

          if (minatKarirResult && karakteristikDiriResult) {
            const mbtiMapping = mbtiToCareerMapping[karakteristikDiriResult];
            if (mbtiMapping) {
              if (minatKarirResult === mbtiMapping.dominant) {
                bidangKarirIdealResult = "sangat_sesuai";
              } else if (minatKarirResult === mbtiMapping.secondary) {
                bidangKarirIdealResult = "cukup_sesuai";
              }
            }
          }

          results.push({
            submissionId: submission.id,
            subtestId: bidangKarirIdealSubtest.id,
            resultValue: bidangKarirIdealResult,
          });
        }

        // Calculate Pola Perilaku Result
        let polaPerilakuResult = "tidak_siap";
        if (polaPerilakuSubtest) {
          if (kesejahteraanScore >= 121 && kesejahteraanScore <= 180) {
            polaPerilakuResult = "sangat_siap";
          } else if (kesejahteraanScore >= 61 && kesejahteraanScore <= 120) {
            polaPerilakuResult = "cukup_siap";
          } else if (kesejahteraanScore >= 0 && kesejahteraanScore <= 60) {
            polaPerilakuResult = "tidak_siap";
          }

          results.push({
            submissionId: submission.id,
            subtestId: polaPerilakuSubtest.id,
            resultValue: polaPerilakuResult,
          });
        }

        // Note: Nine Box Talent is a calculated result based on Bidang Karir Ideal and Pola Perilaku
        // It should be calculated on-the-fly in the backend when needed, not stored in the database
        // The calculation logic:
        // - Critical Mismatch: tidak_sesuai + tidak_siap
        // - Inconsistent Fit Zone: tidak_sesuai + cukup_siap
        // - Happy But Misaligned: tidak_sesuai + sangat_siap
        // - Underdeveloped Potential: cukup_sesuai + tidak_siap
        // - Growth Zone: cukup_sesuai + cukup_siap
        // - Positive Explorers: cukup_sesuai + sangat_siap
        // - Latent Talent: sangat_sesuai + tidak_siap
        // - Aligned Developers: sangat_sesuai + cukup_siap
        // - High Fit Champions: sangat_sesuai + sangat_siap

        // Insert all results
        if (results.length > 0) {
          await tx.insert(schema.submissionResultsTable).values(results);
          console.log(
            `Created ${results.length} results for submission ${submission.id}`
          );
        }
      }

      // Create in-progress submissions (partial answers)
      for (const student of inProgressStudents) {
        const [submission] = await tx
          .insert(schema.testSubmissionsTable)
          .values({
            studentId: student.id,
            testId: test.id,
            status: "in_progress",
            completedAt: null,
          })
          .returning();

        console.log(
          `Created in-progress submission for student: ${student.name}`
        );

        // Create partial answers (only answer some questions)
        const answeredQuestions = faker.helpers.arrayElements(
          questions,
          Math.floor(questions.length * 0.3) // Answer 30% of questions
        );

        const studentAnswers = answeredQuestions.map((question) => {
          const questionOptions = options.filter(
            (opt) => opt.questionId === question.id
          );
          const selectedOption = faker.helpers.arrayElement(questionOptions);

          return {
            submissionId: submission.id,
            questionId: question.id,
            selectedOptionId: selectedOption.id,
          };
        });

        if (studentAnswers.length > 0) {
          await tx.insert(schema.studentAnswersTable).values(studentAnswers);
          console.log(
            `Created ${studentAnswers.length} partial answers for submission ${submission.id}`
          );
        }

        // No results for in-progress submissions
      }
    });

    console.log("Successfully seeded test results!");
    return true;
  } catch (error) {
    DatabaseService.logDatabaseError(error);
    return false;
  }
}
