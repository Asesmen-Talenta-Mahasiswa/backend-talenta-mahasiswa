import { desc, eq } from "drizzle-orm";
import db from "../../db";
import { resultsTable, studentsTable } from "../../db/schema";
import { DatabaseService } from "../../db/service";
import { UpdateStudentModel } from "./model";

export abstract class StudentService {
  static async getStudentInfo(npm: string) {
    try {
      const student = await db.query.studentsTable.findFirst({
        with: {
          results: {
            orderBy: desc(resultsTable.createdAt),
          },
        },
        where: eq(studentsTable.npm, npm),
      });

      //   const student = await db.query.resultsTable.findFirst({
      //     with: {
      //       student: true,
      //     },
      //     // where: eq(studentsTable.npm, npm),
      //     // orderBy: desc(resultsTable.createdAt),
      //   });

      console.log(student);

      if (!student) {
        return null;
      }

      return student;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      return null;
    }
  }

  static async updateStudentInfo(npm: string, student: UpdateStudentModel) {
    try {
      const result = await db
        .update(studentsTable)
        .set(student)
        .where(eq(studentsTable.npm, npm))
        .returning();

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      return null;
    }
  }
}
