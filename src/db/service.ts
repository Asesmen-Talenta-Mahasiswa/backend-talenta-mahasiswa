import {
  DrizzleError,
  DrizzleQueryError,
  TransactionRollbackError,
  getTableName,
  sql,
} from "drizzle-orm";
import db from ".";
import { MyLogger } from "../logger";
import { InternalServerError, status } from "elysia";

import * as schema from "../db/schema";
import * as seeds from "../db/seeds";

export abstract class DatabaseService {
  static errorHandle(error: unknown) {
    if (
      error instanceof DrizzleQueryError ||
      error instanceof TransactionRollbackError ||
      error instanceof DrizzleError
    ) {
      if (
        typeof error.cause === "object" &&
        error.cause !== null &&
        "code" in error.cause
      ) {
        switch (error.cause.code) {
          case "ECONNREFUSED":
          case "ENOTFOUND":
          case "ETIMEDOUT":
          case "EHOSTUNREACH":
            MyLogger.error("database", (error.cause as any).message);
            throw status(
              503,
              "Saat ini beberapa layanan sedang tidak tersedia, coba beberapa saat lagi",
            );
          default:
            MyLogger.error("database", (error.cause as any).message);
            throw new InternalServerError();
        }
      }

      MyLogger.error("database", (error.cause as any).message);
      throw new InternalServerError();
    }
  }

  static async seedDatabase() {
    MyLogger.info("database", "Seeding database");
    for (const table of [
      schema.degree,
      schema.department,
      schema.enrollmentYear,
      schema.faculty,
      schema.major,
      schema.student,
      schema.test,
      schema.testInstruction,
      schema.testNote,
      schema.testQuestion,
      schema.testQuestionOption,
      schema.testSubmission,
      schema.testSubmissionAnswer,
      schema.testSubmissionResult,
      schema.user,
    ]) {
      try {
        await db.execute(
          sql.raw(
            `TRUNCATE TABLE "assessment"."${getTableName(table)}" RESTART IDENTITY CASCADE`,
          ),
        );
      } catch (error) {
        throw new InternalServerError();
      }
    }

    let result = false;

    try {
      result = await db.transaction(async (tx) => {
        await seeds.degree(tx);
        await seeds.department(tx);
        await seeds.enrollmentYear(tx);
        await seeds.faculty(tx);
        await seeds.major(tx);
        await seeds.student(tx);
        await seeds.test(tx);
        await seeds.testInstruction(tx);
        await seeds.testNote(tx);
        await seeds.testQuestion(tx);
        await seeds.testQuestionOption(tx);
        await seeds.testSubmission(tx);
        await seeds.testSubmissionAnswer(tx);
        await seeds.testSubmissionResult(tx);
        await seeds.user(tx);
        return true;
      });
    } catch (error) {
      throw new InternalServerError();
    }

    return result;
  }

  static async resetDatabase() {
    for (const table of [
      schema.degree,
      schema.department,
      schema.enrollmentYear,
      schema.faculty,
      schema.major,
      schema.student,
      schema.test,
      schema.testInstruction,
      schema.testNote,
      schema.testQuestion,
      schema.testQuestionOption,
      schema.testSubmission,
      schema.testSubmissionAnswer,
      schema.testSubmissionResult,
      schema.user,
    ]) {
      try {
        await db.execute(
          sql.raw(
            `TRUNCATE TABLE "assessment"."${getTableName(table)}" RESTART IDENTITY CASCADE`,
          ),
        );
      } catch (error) {
        throw new InternalServerError();
      }
    }

    return true;
  }
}
