import { randomUUIDv7 } from "bun";
import { type Transaction } from "..";
import { testSubmissionResult } from "../schema";
import { data as testSubmissionData } from "./testSubmission";
import { data as testQuestionData } from "./testQuestion";
import { data as testQuestionOptionData } from "./testQuestionOption";
// import { data as testSubmissionAnswerData } from "./testSubmissionAnswer";

type TestSubmissionResult = typeof testSubmissionResult.$inferInsert;

const MBTI_DESCRIPTION_MAPPING = {
  mbti_type: {
    ISTJ: "Berdasarkan karakteristik diri kamu, kamu termasuk tipe yang teratur dan logis. Kamu belajar paling efektif dengan jadwal yang jelas, langkah-langkah terencana, dan target konkret. Kamu akan nyaman di tempat belajar yang tenang dan minim distraksi. Untuk berkembang, cobalah sesekali belajar dengan cara yang lebih fleksibel—misalnya berdiskusi atau mencoba pendekatan baru agar tidak terlalu kaku pada rutinitas.",
    ISFJ: "Kamu punya tanggung jawab tinggi dan rasa peduli besar. Kamu belajar dengan baik ketika suasananya stabil, penuh dukungan, dan ada makna personal. Lingkungan yang hangat dan teratur akan membuatmu fokus. Tapi jangan lupa juga untuk memberi waktu buat diri sendiri—belajar tidak harus selalu “sempurna,” yang penting kamu konsisten dan menikmati prosesnya.",
    INFJ: "Kamu belajar dengan mengaitkan ilmu pada nilai dan makna hidup. Proses refleksi pribadi penting untukmu. Kamu cocok belajar di tempat yang tenang dan inspiratif, seperti sudut ruangan favorit atau perpustakaan kecil. Agar makin berkembang, cobalah lebih sering membagikan ide-ide dan pandanganmu ke orang lain—karena pemikiranmu bisa sangat berharga bagi mereka.",
    INTJ: "Kamu tipe perencana jangka panjang dan sangat rasional. Dalam belajar, kamu menyukai konsep yang jelas dan strategi yang efisien. Kamu akan produktif di lingkungan teratur dan tidak banyak gangguan. Untuk menyeimbangkan, cobalah sesekali berdiskusi dengan orang lain—hal itu bisa menambah perspektif baru dan memperkaya strategi berpikirmu.",
    ISTP: "Kamu belajar paling efektif lewat pengalaman langsung dan tantangan nyata. Kamu cepat paham saat bisa mencoba sesuatu sendiri. Lingkungan belajar yang fleksibel dan tidak terlalu formal akan membuatmu nyaman. Agar makin berkembang, cobalah membuat sedikit perencanaan sebelum bertindak supaya hasilnya lebih maksimal dan terarah.",
    ISFP: "Kamu belajar dengan cara yang lembut dan penuh perasaan. Kamu menyukai suasana tenang, nyaman, dan tidak penuh tekanan. Belajar bagi kamu harus terasa menyenangkan dan bermakna. Supaya lebih efektif, cobalah membuat jadwal ringan atau catatan sederhana agar ide-ide kreatifmu tidak hilang begitu saja.",
    INFP: "Kamu belajar dengan hati dan idealisme. Kamu suka memahami sesuatu secara mendalam dan mencari maknanya. Suasana tenang, musik lembut, atau ruang yang nyaman bisa membantu fokusmu. Tantanganmu adalah menuntaskan apa yang sudah dimulai—jadi cobalah buat daftar kecil tujuan harian supaya ide-idemu lebih mudah diwujudkan.",
    INTP: "Kamu suka menganalisis dan berpikir kritis. Belajar bagimu seperti petualangan logika yang menarik. Kamu akan nyaman di tempat yang tenang dan bebas dari gangguan. Agar lebih optimal, latih diri untuk menuntaskan satu hal dulu sebelum beralih ke hal lain, dan jangan ragu berdiskusi agar ide-idemu tetap membumi.",
    ESTP: "Kamu belajar dengan cara langsung terjun ke pengalaman nyata. Kamu cepat tanggap dan suka tantangan. Kamu akan berkembang di lingkungan yang aktif dan dinamis, seperti diskusi terbuka atau proyek lapangan. Namun, jangan lupa juga untuk refleksi—supaya setiap pengalamanmu punya makna, bukan hanya keseruan sesaat.",
    ESFP: "Kamu penuh energi dan semangat ketika belajar. Kamu suka suasana ramai, interaktif, dan menyenangkan. Aktivitas kolaboratif dan praktik langsung cocok buatmu. Tapi sesekali cobalah belajar dalam suasana lebih tenang agar kamu bisa merenungkan apa yang sudah kamu pelajari dan membuatnya lebih bermakna.",
    ENFP: "Kamu kreatif, penuh ide, dan cepat menangkap makna besar dari hal-hal kecil. Kamu belajar dengan baik di lingkungan bebas, terbuka, dan penuh inspirasi. Tantanganmu adalah menjaga fokus, jadi biasakan menulis ide-ide penting dan meninjau ulang catatanmu secara rutin agar semangatmu terarah dan hasil belajarmu lebih nyata.",
    ENTP: "Kamu senang berpikir kritis dan memunculkan ide-ide segar. Belajar bagimu berarti menantang pola lama dan menemukan alternatif baru. Lingkungan yang fleksibel dan mendorong diskusi akan membuatmu berkembang. Untuk lebih optimal, cobalah menindaklanjuti ide yang sudah kamu temukan agar tidak hanya berhenti di konsep.",
    ESTJ: "Kamu belajar dengan pendekatan yang terstruktur dan berorientasi hasil. Kamu suka tahu apa yang harus dilakukan, kapan, dan bagaimana caranya. Kamu akan nyaman di lingkungan yang teratur dan memiliki aturan jelas. Namun, sesekali cobalah lebih fleksibel agar tidak kehilangan peluang belajar dari situasi yang tak terduga.",
    ESFJ: "Kamu tipe yang peduli dan suka belajar bersama orang lain. Kamu berkembang di suasana kelas yang ramah, kolaboratif, dan penuh dukungan. Kamu akan sangat efektif jika punya sistem belajar kelompok. Tapi ingat, beri waktu juga untuk belajar sendiri supaya kamu bisa memahami kebutuhan pribadimu lebih dalam.",
    ENFJ: "Kamu senang membantu orang lain tumbuh dan belajar. Kamu akan berkembang di lingkungan positif, terbuka, dan penuh interaksi. Kamu termotivasi oleh makna sosial dari setiap kegiatan belajar. Tapi pastikan kamu juga menjaga keseimbangan—sediakan waktu refleksi pribadi agar semangatmu tetap utuh.",
    ENTJ: "Kamu berorientasi pada tujuan dan berpikir strategis. Kamu suka tantangan dan ingin menguasai sesuatu secara mendalam. Kamu akan produktif di lingkungan kompetitif dan terstruktur. Namun, agar lebih seimbang, luangkan waktu untuk mendengarkan pandangan orang lain dan memberi ruang bagi sisi kreatifmu.",
  },
  primary: {
    praktisi:
      "Profesi yang termasuk ke dalam kategori bidang karir Praktisi adalah profesi yang berfokus pada penerapan langsung ilmu pengetahuan dan keterampilan untuk memecahkan masalah nyata, memberikan layanan, atau menghasilkan produk yang bermanfaat bagi masyarakat. Bidang ini menuntut kemampuan menghubungkan teori dengan praktik melalui pengalaman konkret di lapangan. Karir dalam kategori ini umumnya bersifat teknis, prosedural, dan berorientasi pada hasil nyata. Ciri khas bidang ini adalah orientasi kuat pada pemecahan masalah praktis, keterampilan profesional, ketelitian, serta etika kerja. Individu yang tertarik di bidang ini disarankan untuk memperkuat pengalaman praktikal, mengikuti magang, atau terlibat dalam proyek penerapan ilmu agar koneksi antara teori dan praktik semakin matang.",
    akademisi:
      "Bidang karir Akademisi mencakup profesi yang berfokus pada pengembangan ilmu pengetahuan melalui kegiatan seperti penelitian, pengajaran, penulisan ilmiah, dan pengembangan teori. Bidang ini identik dengan rasa ingin tahu tinggi, pemikiran sistematis, serta ketertarikan untuk mengeksplorasi ide dan membagikan pengetahuan kepada orang lain. Ciri khas bidang ini meliputi kemampuan analisis dan berpikir kritis, disiplin, serta komitmen terhadap kebenaran ilmiah. Untuk mengembangkan potensi di bidang akademik, penting untuk memperbanyak kegiatan penelitian, menulis karya ilmiah, serta terlibat dalam forum atau komunitas akademik guna memperluas wawasan dan jejaring profesional.",
    wirausaha:
      "Bidang karir Wirausaha berfokus pada pembangunan dan pengelolaan usaha, menciptakan peluang, serta mengambil risiko untuk mencapai pertumbuhan dan keberlanjutan bisnis. Bidang ini melibatkan pengambilan keputusan strategis, kepemimpinan, inovasi, dan ketahanan menghadapi tantangan. Ciri khas bidang ini mencakup kemampuan melihat peluang, memimpin tim, mengelola sumber daya, serta beradaptasi terhadap perubahan pasar. Untuk memperkuat potensi di bidang ini, disarankan untuk mengikuti program kewirausahaan, membangun jejaring bisnis, serta belajar manajemen risiko dan keuangan agar ide dapat diwujudkan secara berkelanjutan.",
    pekerja_kreatif:
      "Profesi dalam bidang karir Pekerja Kreatif berfokus pada penciptaan karya inovatif yang memadukan pengetahuan, keterampilan, dan kreativitas menjadi produk, konten, atau layanan yang unik dan bernilai. Bidang ini memberi ruang besar untuk berekspresi, berimajinasi, dan bereksperimen dengan ide-ide baru. Ciri khas bidang ini adalah fleksibilitas cara kerja, kebebasan berpikir, serta keberanian mencoba pendekatan yang tidak konvensional. Untuk berkembang di bidang ini, individu dapat memperkaya diri dengan eksperimen ide, kolaborasi lintas bidang, serta mengikuti tren dan teknologi baru yang dapat mendukung proses kreatif.",
  },
  secondary: {
    praktisi:
      "Profesi yang termasuk ke dalam kategori bidang karir Praktisi adalah profesi yang berfokus pada penerapan langsung ilmu pengetahuan dan keterampilan untuk memecahkan masalah nyata, memberikan layanan, atau menghasilkan produk yang bermanfaat bagi masyarakat. Bidang ini menuntut kemampuan menghubungkan teori dengan praktik melalui pengalaman konkret di lapangan. Karir dalam kategori ini umumnya bersifat teknis, prosedural, dan berorientasi pada hasil nyata. Ciri khas bidang ini adalah orientasi kuat pada pemecahan masalah praktis, keterampilan profesional, ketelitian, serta etika kerja. Individu yang tertarik di bidang ini disarankan untuk memperkuat pengalaman praktikal, mengikuti magang, atau terlibat dalam proyek penerapan ilmu agar koneksi antara teori dan praktik semakin matang.",
    akademisi:
      "Bidang karir Akademisi mencakup profesi yang berfokus pada pengembangan ilmu pengetahuan melalui kegiatan seperti penelitian, pengajaran, penulisan ilmiah, dan pengembangan teori. Bidang ini identik dengan rasa ingin tahu tinggi, pemikiran sistematis, serta ketertarikan untuk mengeksplorasi ide dan membagikan pengetahuan kepada orang lain. Ciri khas bidang ini meliputi kemampuan analisis dan berpikir kritis, disiplin, serta komitmen terhadap kebenaran ilmiah. Untuk mengembangkan potensi di bidang akademik, penting untuk memperbanyak kegiatan penelitian, menulis karya ilmiah, serta terlibat dalam forum atau komunitas akademik guna memperluas wawasan dan jejaring profesional.",
    wirausaha:
      "Bidang karir Wirausaha berfokus pada pembangunan dan pengelolaan usaha, menciptakan peluang, serta mengambil risiko untuk mencapai pertumbuhan dan keberlanjutan bisnis. Bidang ini melibatkan pengambilan keputusan strategis, kepemimpinan, inovasi, dan ketahanan menghadapi tantangan. Ciri khas bidang ini mencakup kemampuan melihat peluang, memimpin tim, mengelola sumber daya, serta beradaptasi terhadap perubahan pasar. Untuk memperkuat potensi di bidang ini, disarankan untuk mengikuti program kewirausahaan, membangun jejaring bisnis, serta belajar manajemen risiko dan keuangan agar ide dapat diwujudkan secara berkelanjutan.",
    pekerja_kreatif:
      "Profesi dalam bidang karir Pekerja Kreatif berfokus pada penciptaan karya inovatif yang memadukan pengetahuan, keterampilan, dan kreativitas menjadi produk, konten, atau layanan yang unik dan bernilai. Bidang ini memberi ruang besar untuk berekspresi, berimajinasi, dan bereksperimen dengan ide-ide baru. Ciri khas bidang ini adalah fleksibilitas cara kerja, kebebasan berpikir, serta keberanian mencoba pendekatan yang tidak konvensional. Untuk berkembang di bidang ini, individu dapat memperkaya diri dengan eksperimen ide, kolaborasi lintas bidang, serta mengikuti tren dan teknologi baru yang dapat mendukung proses kreatif.",
  },
  thinking_style: {
    analytical:
      "Kamu memiliki kecenderungan berpikir secara logis, sistematis, dan terstruktur. Saat menghadapi suatu informasi, kamu akan lebih nyaman jika data yang disajikan bersifat faktual, objektif, dan disusun dalam pola yang jelas. Kamu cenderung menguraikan informasi menjadi bagian-bagian kecil terlebih dahulu, lalu menyusunnya kembali menjadi struktur logis yang utuh. Dalam proses berpikir, kamu kuat dalam melakukan analisis mendalam, terutama saat perlu mengevaluasi berbagai kemungkinan secara rasional. Namun, ada kalanya kamu terlalu lama mempertimbangkan berbagai faktor hingga sulit mengambil keputusan dengan cepat. Kamu akan lebih optimal jika diberi ruang untuk berpikir tenang, memiliki waktu untuk menyusun argumen yang runtut, dan bekerja dalam situasi yang menghargai ketelitian. Gaya berpikirmu sangat cocok digunakan dalam tugas-tugas yang memerlukan pemikiran kritis, evaluasi sistematis, atau perencanaan strategis.",
    creative:
      "Kamu memiliki kecenderungan berpikir secara imajinatif, asosiatif, dan konseptual. Kamu merasa lebih tertarik dengan informasi yang bersifat abstrak, seperti ide-ide baru, kemungkinan masa depan, metafora, atau skenario yang belum tentu terjadi, tetapi membuka ruang eksplorasi. Dalam mengolah informasi, kamu sering menghubungkan hal-hal yang tampaknya tidak berkaitan menjadi ide yang segar. Kamu menikmati proses brainstorming dan lebih senang memikirkan ide besar ketimbang detail teknis. Saat menyusun solusi, kamu biasanya menawarkan pendekatan yang inovatif dan unik, meski terkadang masih perlu bantuan orang lain untuk menjadikannya lebih konkret dan realistis. Kamu akan lebih optimal jika diberi ruang berpikir terbuka, bisa berdiskusi ide tanpa dibatasi pola baku, dan berada di lingkungan yang menghargai orisinalitas gagasan. Gaya berpikirmu sangat berguna dalam pengembangan program baru, desain kreatif, atau perencanaan jangka panjang yang butuh perspektif visioner.",
    practical:
      "Kamu memiliki kecenderungan berpikir secara realistis, konkret, dan aplikatif. Informasi yang paling kamu sukai biasanya adalah hal-hal yang praktis, instruksi yang jelas, dan hasil yang bisa langsung dilihat atau diukur. Dalam mengelola informasi, kamu tidak bertele-tele. Fokusmu ada pada efisiensi dan penerapan nyata. Kamu lebih tertarik pada pertanyaan “bagaimana cara menerapkannya?” daripada “mengapa ini penting?” Saat memecahkan masalah, kamu tanggap dan cepat dalam menemukan solusi yang bisa langsung dijalankan. Namun, kamu mungkin kadang kurang memberi ruang untuk refleksi atau mempertimbangkan alternatif lain yang lebih dalam. Kamu akan lebih optimal jika diberi tugas yang jelas, bisa langsung dikerjakan, dan hasilnya terukur. Gaya berpikirmu sangat cocok dalam konteks pelaksanaan tugas harian, manajemen lapangan, atau koordinasi kegiatan yang membutuhkan penyelesaian nyata.",
    empathetic:
      "Kamu memiliki kecenderungan berpikir dengan mengutamakan nilai, hubungan sosial, dan konteks emosional. Saat menerima informasi, kamu akan lebih tertarik jika disampaikan melalui cerita, pengalaman pribadi, atau mengandung makna kemanusiaan. Dalam memproses informasi, kamu lebih mengandalkan intuisi dan perasaan. Kamu sering mempertimbangkan bagaimana suatu hal akan berdampak pada orang lain, dan tidak sekadar menilainya dari sisi logika. Ketika menyusun solusi, kamu sangat memperhatikan sisi emosional dan kemanusiaan, bahkan saat hal itu berarti mengambil pendekatan yang tidak sepenuhnya rasional. Terkadang, ini membuat keputusanmu tampak subjektif, tapi justru itulah kekuatanmu dalam membangun empati. Kamu akan lebih optimal jika berada di lingkungan yang mementingkan kerja sama, saling pengertian, dan mendukung ekspresi nilai-nilai pribadi. Gaya berpikirmu sangat penting dalam konteks penyelesaian konflik, konseling, pendidikan humanistik, dan relasi sosial yang bermakna.",
  },
  communication_style: {
    direct:
      "Kamu cenderung memiliki gaya komunikasi yang langsung, lugas, dan efisien. Dalam berkomunikasi, kamu lebih suka menyampaikan inti pesan tanpa banyak basa-basi. Struktur kalimat yang jelas, runtut, dan berbasis logika membuatmu merasa nyaman. Ketika menyampaikan ide atau pendapat, kamu lebih fokus pada kejelasan maksud dan penyusunan argumen yang kuat. Perasaan jarang kamu tampilkan secara eksplisit, dan kamu lebih nyaman mengekspresikan diri melalui data, logika, atau instruksi yang jelas. Dalam tim, kamu sering berperan sebagai pengarah atau pengambil keputusan. Kejelasan posisi dan ketegasan arah menjadi kekuatanmu. Di situasi yang menuntut kecepatan, seperti rapat strategi atau kondisi krisis, kontribusimu sangat berharga. Kamu akan lebih optimal jika bekerja di lingkungan yang menghargai efisiensi, langsung ke pokok permasalahan, dan tidak terlalu menuntut interaksi emosional yang mendalam.",
    harmonious:
      "Kamu memiliki gaya komunikasi yang empatik, penuh pertimbangan sosial, dan menjaga suasana tetap nyaman. Ketika berbicara, kamu akan berhati-hati memilih kata, agar tidak melukai perasaan orang lain. Kamu cenderung mempertimbangkan emosi lawan bicara sebelum menyampaikan isi pikiranmu. Perasaan sering kamu ungkapkan lewat bahasa yang lembut atau melalui gestur nonverbal. Kamu cenderung menunda menyampaikan pendapat jika suasana belum kondusif, dan lebih memilih membangun suasana harmonis terlebih dahulu. Dalam tim, kamu berperan sebagai penjaga keharmonisan, penengah konflik, dan pemberi dukungan emosional. Kamu membantu menciptakan ruang yang aman secara emosional, sehingga anggota tim merasa nyaman bekerja sama. Kamu akan lebih optimal dalam lingkungan kerja yang menekankan kerja sama jangka panjang, hubungan interpersonal yang sehat, serta empati sebagai bagian penting dari komunikasi.",
    innovative:
      "Kamu memiliki gaya komunikasi yang ekspresif, eksploratif, dan penuh energi. Kamu senang berbicara tentang ide-ide baru, menggali kemungkinan, dan menyampaikan pendapat lewat cerita atau analogi yang segar. Saat berkomunikasi, kamu sering berpindah dari satu ide ke ide lain dengan alur yang mengalir bebas. Emosi sering muncul spontan, dan kamu tidak ragu menunjukkan antusiasme saat membahas sesuatu yang kamu yakini. Dalam tim, kamu menjadi penggugah semangat, pencetus ide, dan penggerak kreativitas. Kamu membantu tim melihat sesuatu dari sudut pandang baru dan membuka kemungkinan yang belum terpikirkan. Kamu akan lebih optimal jika berada di lingkungan yang terbuka terhadap eksplorasi ide, memberi ruang untuk eksperimen, dan menghargai dinamika komunikasi yang tidak selalu kaku atau formal.",
    pragmatic:
      "Kamu memiliki gaya komunikasi yang fungsional, langsung, dan berorientasi pada hasil. Bagi kamu, komunikasi adalah alat untuk mencapai tujuan, bukan sekadar pertukaran basa-basi. Saat berbicara, kamu cenderung menggunakan bahasa yang singkat, jelas, dan bisa langsung dipahami. Kamu lebih tertarik pada “apa yang harus dilakukan” dibanding “mengapa hal ini penting secara emosional”. Dalam tim, kamu sering berperan sebagai pelaksana atau penghubung aksi. Kamu membantu menjembatani antara rencana dan eksekusi, serta menjaga agar percakapan tetap fokus pada solusi, bukan sekadar diskusi panjang. Kamu akan lebih optimal jika bekerja dalam tim yang menghargai kepraktisan, fokus pada tindakan nyata, dan tidak terlalu bergantung pada formalitas komunikasi yang berlebihan.",
  },
  working_style: {
    structured_solo:
      "Kamu termasuk tipe yang mandiri, fokus, dan menyukai ketertiban dalam bekerja. Bekerja sendiri tanpa banyak gangguan sosial membuatmu lebih nyaman dan produktif. Kamu tidak terlalu menyukai diskusi yang berlarut-larut atau interupsi yang tidak perlu. Dalam mengelola pekerjaan, kamu terbiasa menyusun langkah-langkah yang jelas, membuat target pribadi, dan menepati tenggat waktu dengan disiplin tinggi. Kamu suka jika segala sesuatu bisa dikendalikan oleh sistem kerja yang kamu rancang sendiri. Kamu akan lebih optimal jika bekerja di tempat yang tenang, minim interupsi, dan memberi keleluasaan untuk mengatur waktu kerja sendiri. Kamu juga akan cocok bekerja dengan orang yang menghargai ruang pribadi, tidak terlalu banyak bicara, dan mampu bekerja mandiri tanpa banyak meminta bantuan.",
    structured_team:
      "Kamu termasuk individu yang sistematis tapi tetap kolaboratif. Kamu menyukai kerja tim, selama ada aturan main yang jelas dan struktur kerja yang rapi. Buatmu, efisiensi dalam tim bisa dicapai kalau semua orang tahu perannya dan menjalankannya dengan tanggung jawab. Biasanya, kamu senang menyusun pembagian tugas, membuat daftar pekerjaan, dan memastikan jalannya proyek tetap sesuai rencana. Kamu juga merasa nyaman jika ada supervisi atau evaluasi berkala. Lingkungan kerja ideal bagimu adalah tempat yang stabil dan profesional, dengan SOP yang jelas dan jadwal yang tertib. Kamu akan lebih produktif jika bekerja dengan rekan yang disiplin, menghargai waktu, dan tidak seenaknya sendiri dalam kerja tim.",
    flexible_solo:
      "Kamu cenderung nyaman bekerja sendiri, tetapi dengan gaya yang lentur dan tidak terlalu kaku. Kamu lebih menyukai kebebasan dalam menentukan cara kerja, waktu, dan alur sendiri, daripada mengikuti sistem yang sudah ditentukan pihak lain. Cara kamu mengelola pekerjaan sering bergantung pada mood, intuisi, atau inspirasi yang muncul secara spontan. Meski begitu, kamu tetap punya standar kualitas pribadi yang tinggi terhadap hasil pekerjaanmu. Lingkungan kerja ideal bagimu adalah tempat yang fleksibel, tidak banyak aturan, dan memberi ruang untuk bekerja dengan caramu sendiri. Kamu akan lebih produktif jika bekerja bersama orang-orang yang tidak menuntut secara berlebihan, tidak suka mengatur-atur, tapi tetap suportif saat kamu butuh bantuan.",
    flexible_team:
      "Kamu adalah tipe yang aktif, spontan, dan sangat menikmati kerja dalam suasana yang dinamis dan sosial. Kamu merasa bersemangat saat bisa bertukar ide secara langsung dan bekerja dalam tim yang seru, terbuka, dan fleksibel. Dalam bekerja, kamu lebih suka diskusi langsung daripada komunikasi formal. Ritme kerja kamu sering menyesuaikan dengan energi dan dinamika tim, dan kamu sangat responsif terhadap situasi yang terus berubah. Kamu akan lebih produktif jika berada dalam lingkungan kerja yang cair, energik, dan tidak terlalu birokratis. Ruang terbuka, banyak kolaborasi, dan atmosfer yang menyenangkan adalah hal-hal yang bisa membuatmu berkembang pesat. Rekan kerja ideal bagimu adalah orang yang komunikatif, terbuka terhadap ide baru, cepat tanggap, dan seru untuk diajak kerja bareng.",
  },
};

const PWB_DESCRIPTION_MAPPING = {
  self_acceptance: {
    meaning:
      "Kemampuan penerimaan diri adalah kesanggupan seseorang untuk melihat dirinya secara utuh — baik kelebihan maupun kekurangannya — tanpa penolakan. Mahasiswa yang memiliki penerimaan diri yang baik mampu bersikap realistis terhadap kelebihan dan keterbatasannya, serta tidak mudah goyah oleh kegagalan. Kemampuan ini membantu mahasiswa untuk lebih percaya diri dalam mengambil tanggung jawab akademik dan menjalankan peran sosial tanpa rasa takut dinilai orang lain.",
    rendah:
      "Tingkat penerimaan dirimu rendah, kondisi ini membuatmu mudah membandingkan diri dengan orang lain dan sulit menghargai prosesmu sendiri. Hal ini bisa menurunkan semangat belajar dan kepercayaan diri ketika menghadapi tantangan.",
    sedang:
      "Tingkat penerimaan dirimu cukup baik, kamu mulai bisa menerima kelebihan dan kekuranganmu, meski kadang masih muncul rasa ragu terhadap kemampuan diri. Kondisi ini membuatmu bisa berkembang, walau belum sepenuhnya bebas dari kritik diri.",
    tinggi:
      "Tingkat penerimaan dirimu tinggi, kamu mampu menghargai perjalanan hidupmu, tidak menutupi kekurangan, dan belajar darinya. Hal ini membuatmu lebih stabil secara emosional dan percaya diri menghadapi tugas dan tanggung jawab.",
  },
  autonomy: {
    meaning:
      "Kemandirian dalam konteks kesejahteraan psikologis adalah kemampuan untuk berpikir, merasa, dan bertindak berdasarkan nilai pribadi, bukan semata karena tekanan sosial. Mahasiswa yang otonom akan lebih berani membuat keputusan belajar, menentukan arah karier, dan bertanggung jawab atas pilihannya. Mereka tidak mudah terombang-ambing oleh opini orang lain, tetapi tetap terbuka terhadap masukan.",
    rendah:
      "Tingkat kemandirianmu rendah, kamu cenderung mudah terpengaruh pendapat orang lain. Akibatnya, kamu sulit menentukan pilihan yang sesuai dengan minat dan nilai pribadimu.",
    sedang:
      "Kemandirianmu cukup baik, kamu bisa membuat keputusan sendiri, meski masih butuh dukungan atau validasi dari orang lain untuk merasa yakin.",
    tinggi:
      "Kemandirianmu tinggi, kamu tahu apa yang kamu inginkan dan mampu mempertahankan pendirian tanpa menutup diri dari perspektif baru. Ini membuatmu tangguh dan konsisten dalam menyelesaikan tanggung jawab akademik.",
  },
  purpose_in_life: {
    meaning:
      "Tujuan hidup mencerminkan sejauh mana seseorang merasa hidupnya bermakna dan terarah. Mahasiswa dengan sense of purpose yang kuat tahu mengapa ia belajar, apa nilai yang ia perjuangkan, dan bagaimana pengetahuan yang diperolehnya dapat memberi manfaat bagi diri dan orang lain. Purpose memberi daya tahan dalam menghadapi stres akademik dan membuat proses belajar terasa lebih berarti.",
    rendah:
      "Tujuan hidupmu masih kabur, kamu mungkin belajar karena tuntutan, bukan karena makna pribadi. Akibatnya, motivasimu mudah turun saat menghadapi kesulitan.",
    sedang:
      "Tujuan hidupmu cukup jelas, kamu tahu arah yang ingin dituju namun kadang belum konsisten menjalankannya.",
    tinggi:
      "Tujuan hidupmu sangat kuat. Kamu belajar dengan penuh semangat karena tahu makna di balik setiap tugas dan langkahmu. Ini memberi keteguhan menghadapi tantangan akademik maupun pribadi.",
  },
  positive_relations: {
    meaning:
      "Kemampuan ini menggambarkan sejauh mana seseorang mampu membangun hubungan yang hangat, saling percaya, dan suportif dengan orang lain. Bagi mahasiswa, hubungan positif akan menjadi sumber dukungan emosional, membantu dalam kerja kelompok, dan membangun jejaring sosial yang memperkaya pengalaman belajar. Mahasiswa yang mampu berhubungan positif juga lebih mudah berkolaborasi dan saling menghargai perbedaan.",
    rendah:
      "Hubungan sosialmu tampak kurang hangat. Kamu mungkin merasa sulit mempercayai orang lain atau enggan bekerja sama, sehingga pengalaman akademik terasa lebih berat karena kurangnya dukungan sosial.",
    sedang:
      "Hubungan sosialmu cukup baik. Kamu mampu berinteraksi dengan nyaman, walau kadang masih menjaga jarak atau mudah tersinggung saat ada perbedaan pendapat.",
    tinggi:
      "Hubungan sosialmu sangat positif. Kamu terbuka, hangat, dan menjadi pribadi yang menyenangkan dalam kerja sama. Kondisi ini membuatmu mudah diterima dan dipercaya dalam berbagai kegiatan kampus.",
  },
  environmental_mastery: {
    meaning:
      "Kemampuan ini mencerminkan sejauh mana seseorang mampu mengatur, menyesuaikan, dan memanfaatkan lingkungan untuk mendukung tujuannya. Bagi mahasiswa, hal ini berarti mampu mengelola waktu, tugas, dan sumber belajar dengan efektif. Mahasiswa yang memiliki environmental mastery mampu menjaga keseimbangan antara studi, organisasi, dan kehidupan pribadi, serta menciptakan suasana belajar yang kondusif bagi dirinya.",
    rendah:
      "Kemampuan mengelola lingkunganmu masih rendah, kamu mungkin sering merasa kewalahan oleh tugas dan mudah terdistraksi. Akibatnya, hasil belajar tidak maksimal.",
    sedang:
      "Kemampuan mengelola lingkunganmu cukup baik, kamu sudah bisa mengatur jadwal dan tugas, meski kadang masih kewalahan ketika beban meningkat.",
    tinggi:
      "Kemampuan mengelola lingkunganmu tinggi, kamu mampu mengatur prioritas dengan baik, memanfaatkan peluang, dan menata lingkungan belajarmu agar produktif dan nyaman.",
  },
  personal_growth: {
    meaning:
      "Pertumbuhan pribadi adalah dorongan untuk terus belajar, bereksperimen, dan menjadi versi diri yang lebih matang. Mahasiswa dengan pertumbuhan pribadi yang tinggi tidak puas berhenti di zona nyaman — mereka terbuka pada umpan balik, belajar dari kesalahan, dan menikmati proses perubahan. Kemampuan ini membuat mahasiswa mampu beradaptasi dengan cepat dan melihat setiap tantangan sebagai kesempatan berkembang.",
    rendah:
      "Tingkat pertumbuhan pribadimu rendah, kamu mungkin merasa stagnan atau takut mencoba hal baru. Akibatnya, potensi dirimu belum berkembang sepenuhnya.",
    sedang:
      "Pertumbuhan pribadimu cukup baik, kamu tertarik belajar hal baru namun kadang cepat menyerah ketika gagal.",
    tinggi:
      "Pertumbuhan pribadimu tinggi, kamu terbuka terhadap perubahan, menikmati proses belajar, dan melihat kegagalan sebagai bagian dari perjalanan menjadi lebih baik.",
  },
};

const CAREER_INTEREST_DESCRIPTION = {
  praktisi:
    "Profesi yang termasuk ke dalam kategori bidang karir Praktisi adalah profesi yang berfokus pada penerapan langsung ilmu pengetahuan dan keterampilan untuk memecahkan masalah nyata, memberikan layanan, atau menghasilkan produk yang bermanfaat bagi masyarakat. Bidang ini menuntut kemampuan menghubungkan teori dengan praktik melalui pengalaman konkret di lapangan. Karir dalam kategori ini umumnya bersifat teknis, prosedural, dan berorientasi pada hasil nyata. Ciri khas bidang ini adalah orientasi kuat pada pemecahan masalah praktis, keterampilan profesional, ketelitian, serta etika kerja. Individu yang tertarik di bidang ini disarankan untuk memperkuat pengalaman praktikal, mengikuti magang, atau terlibat dalam proyek penerapan ilmu agar koneksi antara teori dan praktik semakin matang.",
  akademisi:
    "Bidang karir Akademisi mencakup profesi yang berfokus pada pengembangan ilmu pengetahuan melalui kegiatan seperti penelitian, pengajaran, penulisan ilmiah, dan pengembangan teori. Bidang ini identik dengan rasa ingin tahu tinggi, pemikiran sistematis, serta ketertarikan untuk mengeksplorasi ide dan membagikan pengetahuan kepada orang lain. Ciri khas bidang ini meliputi kemampuan analisis dan berpikir kritis, disiplin, serta komitmen terhadap kebenaran ilmiah. Untuk mengembangkan potensi di bidang akademik, penting untuk memperbanyak kegiatan penelitian, menulis karya ilmiah, serta terlibat dalam forum atau komunitas akademik guna memperluas wawasan dan jejaring profesional.",
  wirausaha:
    "Bidang karir Wirausaha berfokus pada pembangunan dan pengelolaan usaha, menciptakan peluang, serta mengambil risiko untuk mencapai pertumbuhan dan keberlanjutan bisnis. Bidang ini melibatkan pengambilan keputusan strategis, kepemimpinan, inovasi, dan ketahanan menghadapi tantangan. Ciri khas bidang ini mencakup kemampuan melihat peluang, memimpin tim, mengelola sumber daya, serta beradaptasi terhadap perubahan pasar. Untuk memperkuat potensi di bidang ini, disarankan untuk mengikuti program kewirausahaan, membangun jejaring bisnis, serta belajar manajemen risiko dan keuangan agar ide dapat diwujudkan secara berkelanjutan.",
  pekerja_kreatif:
    "Profesi dalam bidang karir Pekerja Kreatif berfokus pada penciptaan karya inovatif yang memadukan pengetahuan, keterampilan, dan kreativitas menjadi produk, konten, atau layanan yang unik dan bernilai. Bidang ini memberi ruang besar untuk berekspresi, berimajinasi, dan bereksperimen dengan ide-ide baru. Ciri khas bidang ini adalah fleksibilitas cara kerja, kebebasan berpikir, serta keberanian mencoba pendekatan yang tidak konvensional. Untuk berkembang di bidang ini, individu dapat memperkaya diri dengan eksperimen ide, kolaborasi lintas bidang, serta mengikuti tren dan teknologi baru yang dapat mendukung proses kreatif.",
};

const SUITABILITY_DESCRIPTION = {
  sangat_sesuai:
    "Karakteristik diri dan minat kamu menunjukkan kecenderungan yang sejalan pada bidang karir yang sama. Kondisi ini menandakan bahwa kamu sudah memiliki arah karir yang cukup jelas dan selaras dengan potensi dirimu.\n\nLangkah selanjutnya adalah mengeksplorasi lebih dalam bidang karir tersebut agar kamu semakin memahami bentuk kontribusi yang paling cocok denganmu. Cobalah untuk:\nMempelajari beragam profesi atau jalur karir yang berada dalam bidang tersebut, agar kamu bisa menemukan peran yang paling sesuai dengan gaya berpikir dan kekuatan pribadimu.\nMeningkatkan kompetensi dan pengalaman nyata dengan mengikuti kegiatan, magang, atau proyek yang relevan, sehingga kamu dapat menguji sejauh mana bidang itu benar-benar membuatmu berkembang.\nMembangun koneksi dan berdiskusi dengan orang-orang yang sudah berpengalaman di bidang tersebut, untuk memperluas wawasan dan mendapatkan gambaran dunia kerja yang lebih konkret.\nKeselarasan antara minat dan karakteristik diri adalah modal berharga untuk merancang masa depan karirmu. Dengan terus bereksperimen, belajar, dan memperdalam pemahaman tentang dirimu, kamu akan mampu menemukan bidang karir yang bukan hanya sesuai dengan kemampuanmu, tapi juga memberikan makna dan kepuasan pribadi.",
  kurang_sesuai:
    "Karena karakteristik diri dan minat yang kamu miliki belum menunjukkan kecenderungan pada bidang karir yang sama, maka hal yang dapat kamu lakukan adalah mulai mengeksplorasi berbagai pilihan profesi yang masih sejalan dengan bidang keilmuanmu.\n\nPerbedaan antara minat dan karakteristik ini bukan hal yang negatif. Justru bisa menjadi tanda bahwa kamu sedang berada pada tahap pencarian arah karir yang lebih sesuai dengan jati diri dan potensi dirimu. Cobalah untuk:\nMengenali lebih dalam pola kerja dan situasi yang membuatmu merasa “hidup” — apakah kamu lebih menikmati suasana kolaboratif, penelitian mendalam, menciptakan karya baru, atau justru tantangan di lapangan.\nMencoba pengalaman baru seperti magang, kegiatan organisasi, proyek kolaboratif, atau volunteering untuk melihat bidang mana yang benar-benar membuatmu tertarik dan berkembang.\nMerefleksikan kekuatan alami yang kamu miliki (berdasarkan karakteristik MBTI-mu) dan lihat bagaimana kekuatan itu bisa diterapkan di bidang yang berbeda, bukan hanya di satu jenis karir.\nSemakin sering kamu mencoba dan merefleksikan pengalamanmu, kamu akan semakin peka terhadap keterhubungan antara potensi dan minat pribadi. Dari sana, arah karirmu akan menjadi lebih jelas dan realistis — bukan hanya berdasarkan apa yang menarik, tapi juga apa yang benar-benar selaras dengan cara kamu berpikir, berinteraksi, dan bekerja.",
  tidak_sesuai:
    "Karena karakteristik diri dan minat yang kamu miliki belum menunjukkan kecenderungan pada bidang karir yang sama, maka hal yang dapat kamu lakukan adalah mulai mengeksplorasi berbagai pilihan profesi yang masih sejalan dengan bidang keilmuanmu.\n\nPerbedaan antara minat dan karakteristik ini bukan hal yang negatif. Justru bisa menjadi tanda bahwa kamu sedang berada pada tahap pencarian arah karir yang lebih sesuai dengan jati diri dan potensi dirimu. Cobalah untuk:\nMengenali lebih dalam pola kerja dan situasi yang membuatmu merasa “hidup” — apakah kamu lebih menikmati suasana kolaboratif, penelitian mendalam, menciptakan karya baru, atau justru tantangan di lapangan.\nMencoba pengalaman baru seperti magang, kegiatan organisasi, proyek kolaboratif, atau volunteering untuk melihat bidang mana yang benar-benar membuatmu tertarik dan berkembang.\nMerefleksikan kekuatan alami yang kamu miliki (berdasarkan karakteristik MBTI-mu) dan lihat bagaimana kekuatan itu bisa diterapkan di bidang yang berbeda, bukan hanya di satu jenis karir.\nSemakin sering kamu mencoba dan merefleksikan pengalamanmu, kamu akan semakin peka terhadap keterhubungan antara potensi dan minat pribadi. Dari sana, arah karirmu akan menjadi lebih jelas dan realistis — bukan hanya berdasarkan apa yang menarik, tapi juga apa yang benar-benar selaras dengan cara kamu berpikir, berinteraksi, dan bekerja.",
};

// MBTI to career mapping
const MBTI_MAPPING: Record<
  string,
  {
    primary: string;
    secondary: string;
    thinking_style: string;
    communication_style: string;
    working_style: string;
  }
> = {
  ISTJ: {
    primary: "praktisi",
    secondary: "akademisi",
    thinking_style: "analytical",
    communication_style: "direct",
    working_style: "structured_solo",
  },
  ISFJ: {
    primary: "praktisi",
    secondary: "pekerja_kreatif",
    thinking_style: "practical",
    communication_style: "harmonious",
    working_style: "structured_team",
  },
  INFJ: {
    primary: "akademisi",
    secondary: "pekerja_kreatif",
    thinking_style: "creative",
    communication_style: "innovative",
    working_style: "structured_solo",
  },
  INTJ: {
    primary: "akademisi",
    secondary: "wirausaha",
    thinking_style: "analytical",
    communication_style: "direct",
    working_style: "structured_solo",
  },
  ISTP: {
    primary: "praktisi",
    secondary: "wirausaha",
    thinking_style: "practical",
    communication_style: "pragmatic",
    working_style: "structured_solo",
  },
  ISFP: {
    primary: "pekerja_kreatif",
    secondary: "praktisi",
    thinking_style: "empathetic",
    communication_style: "pragmatic",
    working_style: "flexible_solo",
  },
  INFP: {
    primary: "pekerja_kreatif",
    secondary: "akademisi",
    thinking_style: "creative",
    communication_style: "harmonious",
    working_style: "flexible_solo",
  },
  INTP: {
    primary: "akademisi",
    secondary: "pekerja_kreatif",
    thinking_style: "analytical",
    communication_style: "harmonious",
    working_style: "flexible_solo",
  },
  ESTP: {
    primary: "wirausaha",
    secondary: "praktisi",
    thinking_style: "practical",
    communication_style: "pragmatic",
    working_style: "flexible_team",
  },
  ESFP: {
    primary: "pekerja_kreatif",
    secondary: "wirausaha",
    thinking_style: "empathetic",
    communication_style: "pragmatic",
    working_style: "flexible_team",
  },
  ENFP: {
    primary: "pekerja_kreatif",
    secondary: "wirausaha",
    thinking_style: "creative",
    communication_style: "innovative",
    working_style: "flexible_team",
  },
  ENTP: {
    primary: "wirausaha",
    secondary: "pekerja_kreatif",
    thinking_style: "creative",
    communication_style: "innovative",
    working_style: "flexible_team",
  },
  ESTJ: {
    primary: "praktisi",
    secondary: "wirausaha",
    thinking_style: "practical",
    communication_style: "direct",
    working_style: "structured_team",
  },
  ESFJ: {
    primary: "praktisi",
    secondary: "pekerja_kreatif",
    thinking_style: "practical",
    communication_style: "harmonious",
    working_style: "structured_team",
  },
  ENFJ: {
    primary: "wirausaha",
    secondary: "akademisi",
    thinking_style: "empathetic",
    communication_style: "harmonious",
    working_style: "structured_team",
  },
  ENTJ: {
    primary: "wirausaha",
    secondary: "akademisi",
    thinking_style: "analytical",
    communication_style: "direct",
    working_style: "structured_team",
  },
};

export default async function seed(tx: Transaction) {
  const testSubmissionAnswerData =
    await tx.query.testSubmissionAnswer.findMany();

  // Helper to get answer value for a submission and question
  function getAnswerValue(
    submissionId: string,
    questionId: string,
  ): string | null {
    const answer = testSubmissionAnswerData.find(
      (a) =>
        a.testSubmissionId === submissionId && a.testQuestionId === questionId,
    );
    if (!answer) return null;

    const option = testQuestionOptionData.find(
      (o) => o.id === answer.selectedOptionId,
    );
    return option?.value ?? null;
  }

  // Calculate Test 6 Results (Psychological Well-being Dimensions)
  function calculateTest6Results(submissionId: string): any[] {
    const test6Questions = testQuestionData.filter((q) => q.testId === 6);

    const dimensions = [
      { name: "self_acceptance", start: 0, end: 5 },
      { name: "autonomy", start: 6, end: 11 },
      { name: "purpose_in_life", start: 12, end: 17 },
      { name: "personal_growth", start: 18, end: 23 },
      { name: "environmental_mastery", start: 24, end: 29 },
      { name: "positive_relationships", start: 30, end: 35 },
    ];

    const results: any[] = [];

    for (const dimension of dimensions) {
      const dimensionQuestions = test6Questions.filter(
        (q) => q.order >= dimension.start && q.order <= dimension.end,
      );

      let score = 0;
      for (const question of dimensionQuestions) {
        const value = getAnswerValue(submissionId, question.id!);
        if (value) {
          score += parseInt(value);
        }
      }

      const maxScore = 30; // 6 questions × 5 max value
      const percentage = (score / maxScore) * 100;

      let level = "rendah";
      if (percentage > 66.66) {
        level = "tinggi";
      } else if (percentage > 33.33) {
        level = "sedang";
      }

      // Get meaning and description from PWB_DESCRIPTION_MAPPING
      const dimensionMapping =
        PWB_DESCRIPTION_MAPPING[
          dimension.name as keyof typeof PWB_DESCRIPTION_MAPPING
        ];
      const meaning = dimensionMapping?.meaning ?? "";
      const description =
        dimensionMapping?.[level as keyof typeof dimensionMapping] ?? "";

      results.push({
        dimension: dimension.name,
        meaning: meaning,
        percentage: Math.round(percentage * 100) / 100,
        level: level,
        description: description,
      });
    }

    return results;
  }

  // Calculate Test 5 Results (MBTI)
  function calculateTest5Results(submissionId: string): any[] {
    const test5Questions = testQuestionData.filter((q) => q.testId === 5);

    const letterGroups = [
      { letters: ["E", "I"], start: 0, end: 6 },
      { letters: ["S", "N"], start: 7, end: 13 },
      { letters: ["T", "F"], start: 14, end: 20 },
      { letters: ["J", "P"], start: 21, end: 27 },
    ];

    let mbtiType = "";

    for (const group of letterGroups) {
      const groupQuestions = test5Questions.filter(
        (q) => q.order >= group.start && q.order <= group.end,
      );

      const letterCounts: Record<string, number> = {};
      for (const letter of group.letters) {
        letterCounts[letter] = 0;
      }

      for (const question of groupQuestions) {
        const value = getAnswerValue(submissionId, question.id!);
        if (value && group.letters.includes(value)) {
          letterCounts[value]++;
        }
      }

      // Pick the letter with highest count
      const dominantLetter = group.letters.reduce((a, b) =>
        letterCounts[a] > letterCounts[b] ? a : b,
      );
      mbtiType += dominantLetter;
    }

    const mapping = MBTI_MAPPING[mbtiType.toUpperCase()];

    // Get description for mbti_type
    const mbtiTypeDescription =
      MBTI_DESCRIPTION_MAPPING.mbti_type[
        mbtiType.toUpperCase() as keyof typeof MBTI_DESCRIPTION_MAPPING.mbti_type
      ] ?? "";

    const results: any[] = [
      {
        params: "mbti_type",
        value: mbtiType.toLowerCase(),
        description: mbtiTypeDescription,
      },
    ];

    if (mapping) {
      results.push(
        {
          params: "primary",
          value: mapping.primary,
          description:
            MBTI_DESCRIPTION_MAPPING.primary[
              mapping.primary as keyof typeof MBTI_DESCRIPTION_MAPPING.primary
            ] ?? "",
        },
        {
          params: "secondary",
          value: mapping.secondary,
          description:
            MBTI_DESCRIPTION_MAPPING.secondary[
              mapping.secondary as keyof typeof MBTI_DESCRIPTION_MAPPING.secondary
            ] ?? "",
        },
        {
          params: "thinking_style",
          value: mapping.thinking_style,
          description:
            MBTI_DESCRIPTION_MAPPING.thinking_style[
              mapping.thinking_style as keyof typeof MBTI_DESCRIPTION_MAPPING.thinking_style
            ] ?? "",
        },
        {
          params: "communication_style",
          value: mapping.communication_style,
          description:
            MBTI_DESCRIPTION_MAPPING.communication_style[
              mapping.communication_style as keyof typeof MBTI_DESCRIPTION_MAPPING.communication_style
            ] ?? "",
        },
        {
          params: "working_style",
          value: mapping.working_style,
          description:
            MBTI_DESCRIPTION_MAPPING.working_style[
              mapping.working_style as keyof typeof MBTI_DESCRIPTION_MAPPING.working_style
            ] ?? "",
        },
      );
    }

    return results;
  }

  // Calculate Test 4 Results (Career Interest)
  function calculateTest4Results(submissionId: string): any {
    const test4Questions = testQuestionData.filter((q) => q.testId === 4);

    const valueCounts: Record<string, number> = {
      praktisi: 0,
      akademisi: 0,
      pekerja_kreatif: 0,
      wirausaha: 0,
    };

    for (const question of test4Questions) {
      const value = getAnswerValue(submissionId, question.id!);
      if (value && valueCounts.hasOwnProperty(value)) {
        valueCounts[value]++;
      }
    }

    // Find the highest count
    const dominantValue = Object.keys(valueCounts).reduce((a, b) =>
      valueCounts[a] > valueCounts[b] ? a : b,
    );

    // Get description from CAREER_INTEREST_DESCRIPTION
    const description =
      CAREER_INTEREST_DESCRIPTION[
        dominantValue as keyof typeof CAREER_INTEREST_DESCRIPTION
      ] ?? "";

    return { value: dominantValue, description: description };
  }

  // Calculate Test 3 Results (Readiness)
  function calculateTest3Results(submissionId: string): any {
    const test6Questions = testQuestionData.filter((q) => q.testId === 6);

    let totalScore = 0;
    for (const question of test6Questions) {
      const value = getAnswerValue(submissionId, question.id!);
      if (value) {
        totalScore += parseInt(value);
      }
    }

    let result = "tidak_siap";
    if (totalScore >= 120) {
      result = "sangat_siap";
    } else if (totalScore >= 60) {
      result = "kurang_siap";
    }

    // Currently leave description empty as per requirement
    return { value: result, description: "" };
  }

  // Calculate Test 2 Results (Suitability)
  function calculateTest2Results(
    submissionId: string,
    test4Result: any,
    test5Results: any[],
  ): any {
    const primaryResult = test5Results.find((r) => r.params === "primary");
    const secondaryResult = test5Results.find((r) => r.params === "secondary");

    let result = "tidak_sesuai";

    if (primaryResult && test4Result.value === primaryResult.value) {
      result = "sangat_sesuai";
    } else if (secondaryResult && test4Result.value === secondaryResult.value) {
      result = "kurang_sesuai";
    }

    // Get description from SUITABILITY_DESCRIPTION
    const description =
      SUITABILITY_DESCRIPTION[result as keyof typeof SUITABILITY_DESCRIPTION] ??
      "";

    return { value: result, description: description };
  }

  // Calculate Test 1 Results (Final Zone)
  function calculateTest1Results(test3Result: any, test2Result: any): any {
    const readiness = test3Result.value;
    const suitability = test2Result.value;

    const matrix: Record<string, Record<string, string>> = {
      tidak_siap: {
        tidak_sesuai: "critical_mismatch",
        kurang_sesuai: "underdeveloped_potential",
        sangat_sesuai: "latent_talent_zone",
      },
      kurang_siap: {
        tidak_sesuai: "inconsistent_fit_zone",
        kurang_sesuai: "growth_zone",
        sangat_sesuai: "aligned_developers",
      },
      sangat_siap: {
        tidak_sesuai: "happy_but_misaligned",
        kurang_sesuai: "positive_explorers",
        sangat_sesuai: "high_fit_champions",
      },
    };

    const result = matrix[readiness]?.[suitability] ?? "inconsistent_fit_zone";

    // Currently leave description empty as per requirement
    return { value: result, description: "" };
  }

  // Generate results for each completed submission
  const data: TestSubmissionResult[] = [];

  for (const submission of testSubmissionData) {
    // Only generate results for completed submissions
    if (submission.status !== "completed") continue;

    // Calculate results for each test
    const test6Results = calculateTest6Results(submission.id!);
    const test5Results = calculateTest5Results(submission.id!);
    const test4Result = calculateTest4Results(submission.id!);
    const test3Result = calculateTest3Results(submission.id!);
    const test2Result = calculateTest2Results(
      submission.id!,
      test4Result,
      test5Results,
    );
    const test1Result = calculateTest1Results(test3Result, test2Result);

    // Store Test 6 results (dimensions)
    for (const dimResult of test6Results) {
      data.push({
        id: randomUUIDv7(),
        testSubmissionId: submission.id!,
        testId: 6,
        result: JSON.stringify(dimResult),
      });
    }

    // Store Test 5 results (MBTI)
    for (const mbtiResult of test5Results) {
      data.push({
        id: randomUUIDv7(),
        testSubmissionId: submission.id!,
        testId: 5,
        result: JSON.stringify(mbtiResult),
      });
    }

    // Store Test 4 result (Career Interest)
    data.push({
      id: randomUUIDv7(),
      testSubmissionId: submission.id!,
      testId: 4,
      result: JSON.stringify(test4Result),
    });

    // Store Test 3 result (Readiness)
    data.push({
      id: randomUUIDv7(),
      testSubmissionId: submission.id!,
      testId: 3,
      result: JSON.stringify(test3Result),
    });

    // Store Test 2 result (Suitability)
    data.push({
      id: randomUUIDv7(),
      testSubmissionId: submission.id!,
      testId: 2,
      result: JSON.stringify(test2Result),
    });

    // Store Test 1 result (Final Zone)
    data.push({
      id: randomUUIDv7(),
      testSubmissionId: submission.id!,
      testId: 1,
      result: JSON.stringify(test1Result),
    });
  }

  await tx.insert(testSubmissionResult).values(data);
}
