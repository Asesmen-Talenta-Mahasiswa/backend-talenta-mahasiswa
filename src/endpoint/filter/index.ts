import Elysia, { t } from "elysia";
import { FilterService } from "./service";
import {
  errorResponseModel,
  failResponseModel,
  successResponseModel,
} from "../../common/model";
import {
  degreeModel,
  departmentModel,
  enrollmentYearModel,
  facultyModel,
  majorModel,
} from "./model";

export const filterEndpoint = new Elysia({
  prefix: "/filters",
  tags: ["Filter"],
}).get(
  "/students",
  async ({ status }) => {
    const result = await FilterService.getStudentFilter();
    return status(200, {
      status: "success",
      data: {
        degrees: result.degrees,
        departments: result.departments,
        enrollmentYears: result.enrollmentYears,
        faculties: result.faculties,
        majors: result.majors,
      },
    });
  },
  {
    response: {
      200: t.Object({
        status: successResponseModel,
        data: t.Object({
          degrees: t.Array(degreeModel),
          departments: t.Array(departmentModel),
          enrollmentYears: t.Array(enrollmentYearModel),
          faculties: t.Array(facultyModel),
          majors: t.Array(majorModel),
        }),
      }),
      422: failResponseModel,
      500: errorResponseModel,
    },
  },
);

const a = {
  name: "Asesmen Talenta Mahasiswa",
  description:
    "Tes Asesmen Talenta Mahasiswa merupakan alat ukur yang dirancang untuk membantu mahasiswa mengenali potensi, kepribadian, serta arah pengembangan diri dan karier mereka. Melalui asesmen ini, mahasiswa akan memperoleh gambaran yang lebih komprehensif mengenai minat, karakteristik personal, dan pola perilaku yang memengaruhi cara mereka belajar, berinteraksi, serta mengambil keputusan dalam kehidupan akademik maupun profesional.",
  active: true,
  parentId: null,
  instructions: [
    {
      text: "Asesmen Talenta Mahasiswa terdiri dari 2 bagian utama, yaitu Bidang Karier Ideal (40 pertanyaan) dan Pola Perilaku (36 pertanyaan).",
      order: 0,
    },
    {
      text: "Setiap bagian memiliki instruksi dan cara pengerjaan masing-masing, jadi pastikan kamu membacanya dengan cermat sebelum memulai.",
      order: 1,
    },
    {
      text: "Setelah menyelesaikan semua bagian asesmen, kamu bisa langsung melihat dan mengunduh hasilnya sebagai panduan pengembangan diri dan kariermu.",
      order: 2,
    },
  ],
  notes: [],
  questions: [],
};
