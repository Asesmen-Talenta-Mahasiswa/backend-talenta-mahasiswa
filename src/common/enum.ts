export const ServiceStatus = { Healthy: "healthy", Bad: "bad" } as const;

export const ResponseStatus = {
  Success: "success",
  Error: "error",
  Fail: "fail",
} as const;

export const SubmissionStatus = {
  InProgress: "in_progress",
  Completed: "completed",
} as const;

export const PermissionLevel = {
  Program: "program",
  Department: "department",
  Faculty: "faculty",
  University: "university",
  Admin: "admin",
} as const;

export const Faculty = {
  FISIP: "FISIP",
  FEB: "FEB",
  FMIPA: "FMIPA",
  FP: "FP",
  FT: "FT",
  FH: "FH",
  FKIP: "FKIP",
  FK: "FK",
} as const;

export const Degree = {
  D3: "D3",
  D4: "D4",
  S1: "S1",
} as const;

export const Program = {
  // FISIP
  AdministrasiPerkantoran: "Administrasi Perkantoran",
  HubunganMasyarakat: "Hubungan Masyarakat",
  Perpustakaan: "Perpustakaan",
  IlmuAdministrasiBisnis: "Ilmu Administrasi Bisnis",
  IlmuAdministrasiNegara: "Ilmu Administrasi Negara",
  IlmuKomunikasi: "Ilmu Komunikasi",
  IlmuPemerintahan: "Ilmu Pemerintahan",
  Sosiologi: "Sosiologi",
  // FEB
  Akuntansi: "Akuntansi",
  AkuntansiPsdkuWayKanan: "Akuntansi PSDKU Way Kanan",
  KeuanganDanPerbankan: "Keuangan dan Perbankan",
  ManajemenPemasaran: "Manajemen Pemasaran",
  PerbankanDanKeuanganPsdkuLampungTengah:
    "Perbankan dan Keuangan PSDKU Lampung Tengah",
  Perpajakan: "Perpajakan",
  BisnisDigital: "Bisnis Digital",
  EkonomiPembangunan: "Ekonomi Pembangunan",
  Manajemen: "Manajemen",
  // FMIPA
  ManajemenInformatika: "Manajemen Informatika",
  Biologi: "Biologi",
  BiologiTerapan: "Biologi Terapan",
  Fisika: "Fisika",
  IlmuKomputer: "Ilmu Komputer",
  IlmuKomputerPsdkUWayKanan: "Ilmu Komputer PSDKU Way Kanan",
  Kimia: "Kimia",
  Matematika: "Matematika",
  SistemInformasi: "Sistem Informasi",
  // FP
  Perkebunan: "Perkebunan",
  Agribisnis: "Agribisnis",
  Agronomi: "Agronomi",
  Agroteknologi: "Agroteknologi",
  BudidayaPerairan: "Budidaya Perairan",
  IlmuKelautan: "Ilmu Kelautan",
  IlmuTanah: "Ilmu Tanah",
  Kehutanan: "Kehutanan",
  NutrisiDanTeknologiPakanTernak: "Nutrisi dan Teknologi Pakan Ternak",
  PenyuluhanPertanian: "Penyuluhan Pertanian",
  Peternakan: "Peternakan",
  ProteksiTanaman: "Proteksi Tanaman",
  SumberdayaAkatik: "Sumberdaya Akuatik",
  TeknologiHasilPertanian: "Teknologi Hasil Pertanian",
  TeknologiIndustriPertanian: "Teknologi Industri Pertanian",
  TeknikPertanian: "Teknik Pertanian",
  // FT
  TeknikMesin: "Teknik Mesin",
  TeknikSipil: "Teknik Sipil",
  TeknikSurveyDanPemetaan: "Teknik Survey dan Pemetaan",
  Arsitektur: "Arsitektur",
  TeknikElektro: "Teknik Elektro",
  TeknikGeodesi: "Teknik Geodesi",
  TeknikGeofisika: "Teknik Geofisika",
  TeknikGeologi: "Teknik Geologi",
  TeknikInformatika: "Teknik Informatika",
  TeknikKimia: "Teknik Kimia",
  TeknikLingkungan: "Teknik Lingkungan",
  TeknologiRekayasaOtomotif: "Teknologi Rekayasa Otomotif",
  // FH
  IlmuHukum: "Ilmu Hukum",
  // FKIP
  BimbinganDanKonseling: "Bimbingan dan Konseling",
  PendidikanBahasaDanSastraIndonesia: "Pendidikan Bahasa dan Sastra Indonesia",
  PendidikanBahasaInggris: "Pendidikan Bahasa Inggris",
  PendidikanBahasaLampung: "Pendidikan Bahasa Lampung",
  PendidikanBahasaPerancis: "Pendidikan Bahasa Perancis",
  PendidikanBiologi: "Pendidikan Biologi",
  PendidikanEkonomi: "Pendidikan Ekonomi",
  PendidikanFisika: "Pendidikan Fisika",
  PendidikanGeografi: "Pendidikan Geografi",
  PendidikanGuruPaud: "Pendidikan Guru Pendidikan Anak Usia Dini",
  PendidikanGuruSekolahDasar: "Pendidikan Guru Sekolah Dasar",
  PendidikanJasmani: "Pendidikan Jasmani",
  PendidikanKimia: "Pendidikan Kimia",
  PendidikanMatematika: "Pendidikan Matematika",
  PendidikanMusik: "Pendidikan Musik",
  PendidikanPancasilaDanKewarganegaraan:
    "Pendidikan Pancasila dan Kewarganegaraan",
  PendidikanSejarah: "Pendidikan Sejarah",
  PendidikanTari: "Pendidikan Tari",
  PendidikanTeknologiInformasi: "Pendidikan Teknologi Informasi",
  // FK
  Farmasi: "Farmasi",
  Kedokteran: "Kedokteran",
  Gizi: "Gizi",
} as const;

export const QuestionType = {
  MultipleChoice: "multiple_choice",
  SingleChoice: "single_choice",
  Likert: "likert",
} as const;
