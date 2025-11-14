import { t } from "elysia";
import { successResponseModel } from "../../common/model";
import { dbModel } from "../../db/model";
import { studentModel } from "../student/model";

const selectUser = dbModel.select.user;
const insertUser = dbModel.insert.user;
const selectStudent = dbModel.select.student;

export const jwtSsoClaimModel = t.Object({
  id_aplikasi: t.Union([t.String(), t.Null()]),
  url_aplikasi: t.Union([t.String(), t.Null()]),
  id_pengguna: t.Union([t.String(), t.Null()]),
  username: t.String(),
  nm_pengguna: t.Union([t.String(), t.Null()]),
  peran_pengguna: t.Union([t.String(), t.Null()]),
  id_sdm_pengguna: t.Union([t.String(), t.Null()]),
  id_pd_pengguna: t.Union([t.String(), t.Null()]),
  email: t.Union([t.String(), t.Null()]),
  token_dibuat: t.Union([t.Number(), t.Null()]),
  token_kadarluwasa: t.Union([t.Number(), t.Null()]),
  asal_domain: t.Union([t.String(), t.Null()]),
  ip_address: t.Union([t.String(), t.Null()]),
  sso: t.Union([t.Boolean(), t.Null()]),
});

export const jwtClaimModel = t.Object({
  studentId: t.Union([t.String(), t.Null()]),
  userId: selectUser.id,
  iat: t.Boolean(),
  iss: t.String(),
  jti: t.String(),
  exp: t.String(),
});

export const loginSsoResponseModel = t.Object({
  status: successResponseModel,
  data: studentModel,
});

export const loginModel = t.Object(
  {
    username: selectUser.username,
    password: selectUser.password,
  },
  {
    error: "Request body untuk login tidak valid",
  },
);

export const sessionTokenModel = t.Cookie({
  sessionToken: t.String(),
});

export type LoginOneDataResponseModel = {
  status: boolean;
  message: string;
  latency: number;
  data: {
    token_status: string;
    token_dibuat: string;
    token_kadarluwasa: string;
    token_bearer: string;
  };
};
export type StudentDetailOneDataResponseModel = {
  status: boolean;
  message: string;
  latency: number;
  data: Array<{
    id_pd: string;
    id_reg_pd: string;
    npm: string;
    nm_pd: string;
    nm_prodi: string;
    status_sekarang: string;
    tgl_masuk_sp: string;
    periode_masuk: string;
    nm_pt_asal: string | null;
    nm_prodi_asal: string | null;
    tgl_keluar: string | null;
    ket: string | null;
    skhun: string | null;
    no_peserta_ujian: string | null;
    no_seri_ijazah: string | null;
    asal_data_ijazah: string;
    bidang_mayor: string | null;
    bidang_minor: string | null;
    sks_diakui: string | null;
    jalur_skripsi: string | null;
    judul_skripsi: string | null;
    bln_awal_bimbingan: string | null;
    bln_akhir_bimbingan: string | null;
    sk_yudisium: string | null;
    tgl_sk_yudisium: string | null;
    ipk: string | null;
    sert_prof: string | null;
    a_pindah_mhs_asing: string | null;
    biaya_masuk_kuliah: string;
    nm_lemb: string;
    nik: string;
    id_kk: string;
    nm_agama: string;
    jk: string;
    tlpn_hp: string;
    tlpn_rumah: string | null;
    tmpt_lahir: string;
    tgl_lahir: string;
    jln: string;
    rt: string;
    rw: string | null;
    ds_kel: string;
    nm_jns_daftar: string;
    email: string | null;
    nm_jalur_daftar: string;
    nm_pembiayaan: string;
    nisn: string;
    nm_dsn: string | null;
    kode_pos: string;
    a_pmpap: string;
    a_bidikmisi: string;
    a_bebas_biaya: string;
    nm_wali: string | null;
    tgl_lahir_wali: string | null;
    id_pendidikan_wali: string | null;
    id_pekerjaan_wali: string | null;
    id_penghasilan_wali: string | null;
    nm_ayah: string | null;
    tgl_lahir_ayah: string | null;
    nik_ayah: string | null;
    id_pendidikan_ayah: string | null;
    id_pekerjaan_ayah: string | null;
    id_penghasilan_ayah: string | null;
    id_kk_ayah: string;
    nm_ibu_kandung: string;
    tgl_lahir_ibu: string | null;
    nik_ibu: string | null;
    id_pendidikan_ibu: string | null;
    id_pekerjaan_ibu: string | null;
    id_penghasilan_ibu: string | null;
    id_kk_ibu: string;
    a_terima_kps: string;
    no_kps: string | null;
    id_kewarganegaraan: string;
    id_agama: string;
    id_blob: string | null;
    id_jns_tinggal: string | null;
    id_stat_mhs: string;
    id_alat_transport: string | null;
    id_wil: string;
    create_date: string;
    id_creator: string;
    last_update: string;
    id_updater: string;
    soft_delete: string;
    last_sync: string;
    id_sp: string;
    id_sms: string;
    id_jns_daftar: string;
    id_jalur_daftar: string;
    id_pembiayaan: string;
    id_smt: string;
    nipd: string;
    id_semester_masuk: string;
    id_pt_asal: string | null;
    id_prodi_asal: string | null;
    id_jns_keluar: string | null;
  }>;
};
export type GetStudentDetailOneDataResponseModel = {
  status: boolean;
  message: string;
  latency: number;
  data: any[];
};
export type LoginOneDataModel = {
  id_aplikasi: string;
  username: string;
  password: string;
};
export type JwtSsoClaimModel = typeof jwtSsoClaimModel.static;
export type EmptyStudentModel = {
  npm: string;
  name: string;
};
