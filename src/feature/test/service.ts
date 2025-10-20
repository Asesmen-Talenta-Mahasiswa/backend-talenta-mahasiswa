import { and, eq, isNull, or } from "drizzle-orm";
import db from "../../db";
import { DatabaseService } from "../../db/service";
import { testsTable } from "../../db/schema";
import { InternalServerError } from "elysia";

export abstract class TestService {
  static async getTest(testId: number) {
    try {
      const test = await db.query.testsTable.findFirst({
        with: {
          instructions: true,
          notes: true,
          questions: {
            with: {
              options: true,
            },
          },
          children: true,
        },
        where: eq(testsTable.id, testId),
      });
      return test;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTests() {
    try {
      const tests = await db.query.testsTable.findMany({
        where: and(isNull(testsTable.parentId)),
      });

      return tests;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }
}
