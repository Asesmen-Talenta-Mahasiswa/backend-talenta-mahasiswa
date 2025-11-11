import { InternalServerError, status } from "elysia";
import db from "../../db";
import { DatabaseService } from "../../db/service";
import { eq, TransactionRollbackError } from "drizzle-orm";
import {
  testSubmission,
  testSubmissionAnswer,
  testSubmissionResult,
} from "../../db/schema";
import type {
  NewTestSubmissionAnswerModel,
  NewTestSubmissionModel,
  NewTestSubmissionResultModel,
  UpdateTestSubmissionAnswerModel,
  UpdateTestSubmissionModel,
} from "../test/model";
import { SystemService } from "../system/service";
import type { FailResponseModel } from "../../common/model";

export abstract class ResultService {
  static async getTestSubmission(submissionId: string) {
    try {
      const submission = await db.query.testSubmission.findFirst({
        where: (col, { eq }) => eq(col.id, submissionId),
        with: {
          answers: true,
          results: true,
        },
      });

      return submission ?? null;
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async getResults() {
    try {
      // 1. Total responden
      // 2. 9 Box talent (Kesesuai minat bakat (Potensi) dan PWB (Performa))
      // 3. Minat Karir (Praktisi, Akademisi, P.Kreatif, Wirausaha)
      // 4. Kesesuai minat bakat (Potensi) (sangat_sesuai, kurang_sesuai, tidak_sesuai)
      // 5. Pola Perilaku (Performa) (sangat_siap, cukup_siap, tidak_siap)
      // 6. Pola Berpikir - MBTI (analytical, creative, practical, empathetic)
      // 7. Gaya Komunikasi - MBTI (direct, harmonious, innovative, pragmatic)
      // 8. Tipe Emosi - MBTI (structured_team, sctructured_solo, flexible_solo, flexible_team)
      // Perdimensi nilai nya adalah persentase (30/30*100%) kemudian nanti di rata-rata per tingkat
      // 9. Dimensi PWB (self acceptance, autonomy, purpose in life, personal growth, environmental mastery, positive relationship with others)
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async createTestSubmission(newSubmission: NewTestSubmissionModel) {
    try {
      const result = await db
        .insert(testSubmission)
        .values(newSubmission)
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async createTestSubmissionAnswer(
    newAnswer: NewTestSubmissionAnswerModel,
  ) {
    try {
      const result = await db
        .insert(testSubmissionAnswer)
        .values(newAnswer)
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async createTestSubmissionResult(
    newResult: NewTestSubmissionResultModel,
  ) {
    try {
      const result = await db
        .insert(testSubmissionResult)
        .values(newResult)
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async updateTestSubmission(
    submissionId: string,
    submission: UpdateTestSubmissionModel,
  ) {
    const { status, completedAt, ..._ } = submission;

    if (!status && !completedAt) return null;

    try {
      const result = await db
        .update(testSubmission)
        .set({ status, completedAt })
        .where(eq(testSubmission.id, submissionId))
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async updateTestSubmissionAnswer(
    submissionId: string,
    answers: UpdateTestSubmissionAnswerModel,
  ) {
    try {
      // Fetch the submission with existing answers
      const submission = await db.query.testSubmission.findFirst({
        where: (col, { eq }) => eq(col.id, submissionId),
        with: {
          answers: true,
        },
      });

      if (!submission) {
        throw status(404, {
          status: "fail",
          data: [
            {
              field: "submissionId",
              message: "Submisi tes tidak ditemukan",
            },
          ],
        } satisfies FailResponseModel);
      }

      await db.transaction(async (tx) => {
        // DELETE all existing answers for this submission (PUT behavior - replace entire resource)
        await tx
          .delete(testSubmissionAnswer)
          .where(eq(testSubmissionAnswer.testSubmissionId, submissionId));

        // INSERT all new answers
        for (const ans of answers) {
          const {
            id: _ignored,
            testSubmissionId: _alsoIgnored,
            ...rest
          } = ans as any;

          const payload = {
            ...rest,
            testSubmissionId: submissionId,
          } as any;

          await tx.insert(testSubmissionAnswer).values(payload);
        }
      });

      // Return fresh snapshot of all answers for this submission
      const updated = await db.query.testSubmission.findFirst({
        columns: {},
        where: (col, { eq }) => eq(col.id, submissionId),
        with: {
          answers: true,
        },
      });

      return updated?.answers ?? [];
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }
}
