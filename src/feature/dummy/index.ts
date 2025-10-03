import Elysia from "elysia";
import z from "zod";

export const dummyEndpoint = new Elysia({ prefix: "/dummy", tags: ["Dummy"] })
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
        200: z.object({
          status: z.string(),
          message: z.string(),
          data: z.object({
            tests: z.array(
              z.object({
                id: z.uuid(),
                title: z.string(),
                description: z.string(),
                isActive: z.boolean(),
                createdAt: z.string(),
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
        200: z.object({
          status: z.string(),
          message: z.string(),
          data: z.object({
            test: z.object({
              id: z.uuid(),
              title: z.string(),
              description: z.string(),
              isActive: z.boolean(),
              createdAt: z.string(),
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
        200: z.object({
          status: z.string(),
          message: z.string(),
          data: z.object({
            questions: z.array(
              z.object({
                id: z.uuid(),
                testId: z.uuid(),
                title: z.string(),
                type: z.enum(["multiple_choice", "single_choice", "likert"]),
                options: z.array(
                  z.object({
                    id: z.uuid(),
                    text: z.string(),
                    category: z.enum([
                      "praktisi",
                      "akademisi",
                      "pekerja_kreatif",
                      "wirausaha",
                    ]),
                  })
                ),
                createdAt: z.string(),
              })
            ),
          }),
        }),
      },
    }
  );
