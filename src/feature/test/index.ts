import Elysia, { NotFoundError } from "elysia";
import db from "../../db";

export const testEndpoint = new Elysia({ prefix: "/test", tags: ["Test"] })
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
  .get("", async () => {
    const getTest = await db.query.testsTable.findMany({
      with: {
        subTests: {
          columns: {
            testId: false,
          },
          with: {
            instructions: {
              columns: {
                subtestId: false,
              },
            },
            notes: {
              columns: {
                subtestId: false,
              },
            },
            questions: {
              columns: {
                subtestId: false,
              },
              with: {
                options: {
                  columns: {
                    questionId: false,
                  },
                },
              },
            },
          },
        },
      },
    });

    const getResult = await db.query.testSubmissionsTable.findMany({
      with: {
        student: true,
        results: {
          with: {
            subTest: true,
          },
        },
        answers: {
          with: {
            selectedOption: true,
          },
        },
      },
    });

    return getResult[2];
  });
