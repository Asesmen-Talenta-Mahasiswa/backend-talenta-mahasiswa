import Elysia, { NotFoundError, t } from "elysia";

const questionType = {
  multipleChoice: "multiple_choice",
  singleChoice: "single_choice",
  likert: "likert",
} as const;

const careerCategory = {
  praktisi: "praktisi",
  akademisi: "akademisi",
  pekerjaKreatif: "pekerja_kreatif",
  wirausaha: "wirausaha",
} as const;

export const dummyEndpoint = new Elysia({ prefix: "/dummy", tags: ["Dummy"] })
  .all(
    "/",
    () => {
      throw new NotFoundError();
    },
    {
      detail: {
        hide: true,
      },
    }
  )
  .get(
    "/tests",
    () => {
      return {
        status: "success",
        message: "Data test berhasil di ambil",
        data: {
          tests: [
            {
              id: "88b9857b-0e6b-45e2-9a6f-89cfb89b93d5",
              title: "Test A",
              description:
                "Test ini bertujuan untuk mengukur minat individu terhadap berbagai bidang karir yang ada.",
              isActive: true,
              createdAt: "2024-06-20T12:34:56.789Z",
            },
            {
              id: "bbbbd4e2-eb74-49be-89e9-bef31d42169f",
              title: "Test B",
              description:
                "Test ini bertujuan untuk mengidentifikasi tipe kepribadian individu berdasarkan teori MBTI.",
              isActive: true,
              createdAt: "2024-06-21T09:15:30.123Z",
            },
            {
              id: "bbcdd699-2bf7-449a-bc36-c63caeae72f0",
              title: "Test C",
              description:
                "Test ini bertujuan untuk mengidentifikasi tipe kepribadian individu berdasarkan teori MBTI.",
              isActive: true,
              createdAt: "2024-06-21T09:15:30.123Z",
            },
          ],
        },
      };
    },
    {
      response: {
        200: t.Object({
          status: t.String(),
          message: t.String(),
          data: t.Object({
            tests: t.Array(
              t.Object({
                id: t.String({ format: "uuid" }),
                title: t.String(),
                description: t.String(),
                isActive: t.Boolean(),
                createdAt: t.String(),
              })
            ),
          }),
        }),
      },
    }
  )
  .get(
    "/tests/:id",
    (ctx) => {
      const { id } = ctx.params;
      return {
        status: "success",
        message: "Data test berhasil di ambil",
        data: {
          test: {
            id: id,
            title: "Test A",
            description:
              "Test ini bertujuan untuk mengukur minat individu terhadap berbagai bidang karir yang ada.",
            isActive: true,
            createdAt: "2024-06-20T12:34:56.789Z",
          },
        },
      };
    },
    {
      response: {
        200: t.Object({
          status: t.String(),
          message: t.String(),
          data: t.Object({
            test: t.Object({
              id: t.String({ format: "uuid" }),
              title: t.String(),
              description: t.String(),
              isActive: t.Boolean(),
              createdAt: t.String(),
            }),
          }),
        }),
      },
    }
  )
  .get(
    "/tests/:id/questions",
    (ctx) => {
      const { id } = ctx.params;
      return {
        status: "success",
        message: "Data questions berhasil di ambil",
        data: {
          questions: [
            {
              id: "0f35a108-ee49-4017-901d-534681b35454",
              testId: id,
              title: "Pertanyaan 1",
              type: "single_choice",
              options: [
                {
                  id: "86eb3f49-7905-4476-8f34-f391747e224d",
                  text: "Opsi 1",
                  category: "praktisi",
                },
                {
                  id: "3fbc4deb-992d-4611-9071-37ee9d30aaaa",
                  text: "Opsi 2",
                  category: "akademisi",
                },
                {
                  id: "83f98e3c-652d-4edc-9ead-cc654464e806",
                  text: "Opsi 3",
                  category: "pekerja_kreatif",
                },
                {
                  id: "6e38d5b9-edb0-4dac-bde6-1944eabff558",
                  text: "Opsi 4",
                  category: "wirausaha",
                },
              ],
              createdAt: "2024-06-20T12:34:56.789Z",
            },
            {
              id: "d935be5e-fa4c-4fe7-8846-14420a3ba1de",
              testId: id,
              title: "Pertanyaan 2",
              type: "single_choice",
              options: [
                {
                  id: "86eb3f49-7905-4476-8f34-f391747e224d",
                  text: "Opsi 1",
                  category: "praktisi",
                },
                {
                  id: "3fbc4deb-992d-4611-9071-37ee9d30aaaa",
                  text: "Opsi 2",
                  category: "akademisi",
                },
                {
                  id: "83f98e3c-652d-4edc-9ead-cc654464e806",
                  text: "Opsi 3",
                  category: "pekerja_kreatif",
                },
                {
                  id: "6e38d5b9-edb0-4dac-bde6-1944eabff558",
                  text: "Opsi 4",
                  category: "wirausaha",
                },
              ],
              createdAt: "2024-06-20T12:34:56.789Z",
            },
          ],
        },
      };
    },
    {
      response: {
        200: t.Object({
          status: t.String(),
          message: t.String(),
          data: t.Object({
            questions: t.Array(
              t.Object({
                id: t.String({ format: "uuid" }),
                testId: t.String({ format: "uuid" }),
                title: t.String(),
                type: t.Enum(questionType),
                options: t.Array(
                  t.Object({
                    id: t.String({ format: "uuid" }),
                    text: t.String(),
                    category: t.Enum(careerCategory),
                  })
                ),
                createdAt: t.String(),
              })
            ),
          }),
        }),
      },
    }
  );
