import { InternalServerError } from "elysia";
import { DatabaseService } from "../../db/service";
import db from "../../db";
import {
  NewStudentAnswerModel,
  NewSubmissionResultModel,
  NewTestSubmissionModel,
  UpdateStudentAnswerModel,
  UpdateTestSubmissionModel,
} from "./model";
import {
  studentAnswersTable,
  submissionResultsTable,
  testSubmissionsTable,
} from "../../db/schema";
import { eq } from "drizzle-orm";

export abstract class ResultService {
  static async getResults() {
    try {
      // 1. Total responden
      // 2. 9 Box talent (Kesesuai minat bakat (Potensi) dan PWB (Performa))
      // 3. Minat Karir (Praktisi, Akademisi, P.Kreatif, Wirausaha)
      // 4. Kesesuai minat bakat (Potensi) (sangat_sesuai, kurang_sesuai, tidak_sesuai)
      // 5. Pola Perilaku (Performa) (sangat_siap, cukup_siap, tidak_siap)
      // 6. Pola Berpikir - MBTI
      // 7. Gaya Komunikasi - MBTI
      // 8. Tipe Emosi - MBTI
      // Perdimensi nilai nya adalah persentase (30/30*100%) kemudian nanti di rata-rata per tingkat
      // 9. Dimensi PWB (self acceptance, autonomy, purpose in life, personal growth, environemtal mastery, positive relationship with others)
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async createTestSubmission(newSubmission: NewTestSubmissionModel) {
    try {
      const result = await db
        .insert(testSubmissionsTable)
        .values(newSubmission)
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async createStudentAnswer(newAnswer: NewStudentAnswerModel) {
    try {
      const result = await db.insert(studentAnswersTable).values(newAnswer).returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async createSubmissionResult(newResult: NewSubmissionResultModel) {
    try {
      const result = await db
        .insert(submissionResultsTable)
        .values(newResult)
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async updateTestSubmission(
    submissionId: string,
    submission: UpdateTestSubmissionModel
  ) {
    try {
      const transformed = submission.completedAt
        ? {
            status: submission.status,
            completedAt: new Date(submission.completedAt),
          }
        : {
            status: submission.status,
            completedAt: undefined,
          };
      const result = await db
        .update(testSubmissionsTable)
        .set(transformed)
        .where(eq(testSubmissionsTable.id, submissionId))
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async updateStudentAnswer(answerId: string, answer: UpdateStudentAnswerModel) {
    try {
      const result = await db
        .update(studentAnswersTable)
        .set(answer)
        .where(eq(studentAnswersTable.id, answerId))
        .returning();
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }
}
