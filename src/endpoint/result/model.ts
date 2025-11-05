import { t } from "elysia";
import { testSubmissionModel, testSubmissionAnswerModel } from "../test/model";

export const testSubmissionParamsModel = t.Object({
  submissionId: t.String({
    format: "uuid",
    error: "ID submisi harus berupa UUID",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
});

export const testSubmissionAnswerParamsModel = t.Object({
  answerId: t.String({
    format: "uuid",
    error: "ID jawaban submisi harus berupa UUID",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
});

export const testSubmissionWithAnswersModel = t.Object({
  ...testSubmissionModel.properties,
  answers: t.Array(testSubmissionAnswerModel),
});
