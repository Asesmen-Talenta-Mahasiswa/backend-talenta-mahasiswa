import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { status } from "elysia";
import db from "../../db";
import { student as studentsTable } from "../../db/schema";
import type { NewStudentModel, UpdateStudentModel } from "./model";
import type { FailResponseModel } from "../../common/model";
import { SystemService } from "../system/service";

export abstract class StudentService {
  static async getStudents(
    page = 1,
    pageSize = 10,
    search = "",
    majorIds: number[] = [],
    departmentIds: number[] = [],
    facultyIds: number[] = [],
    sortDirection: "asc" | "desc" = "desc",
  ) {
    try {
      const whereClause = and(
        or(
          search ? ilike(studentsTable.npm, `%${search}%`) : undefined,
          search ? ilike(studentsTable.name, `%${search}%`) : undefined,
        ),
        and(
          majorIds.length > 0
            ? inArray(studentsTable.majorId, majorIds)
            : undefined,
          facultyIds.length > 0
            ? inArray(studentsTable.facultyId, facultyIds)
            : undefined,
          departmentIds.length > 0
            ? inArray(studentsTable.departmentId, departmentIds)
            : undefined,
        ),
      );

      const students = await db.query.student.findMany({
        where: whereClause,
        orderBy: (studentColumn, { desc, asc }) => [
          sortDirection === "desc"
            ? desc(studentColumn.id)
            : asc(studentColumn.id),
        ],
        with: {
          submissions: {
            limit: 1,
            orderBy: (submissionColumn, { desc, asc }) => [
              sortDirection === "desc"
                ? desc(submissionColumn.id)
                : asc(submissionColumn.id),
            ],
            with: {
              results: {
                with: {
                  test: true,
                },
              },
            },
          },
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      const totalItems = await db.$count(studentsTable);
      const totalPages =
        pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;

      return {
        students,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      };
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async getStudent(npm: string) {
    try {
      const student = await db.query.student.findFirst({
        with: {
          submissions: {
            orderBy: (submissionColumn, { desc }) => [
              desc(submissionColumn.id),
            ],
            with: {
              results: {
                with: {
                  test: true,
                },
              },
            },
          },
        },
        where: eq(studentsTable.npm, npm),
      });
      return student;
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async createStudent(newStudent: NewStudentModel) {
    try {
      const majorIdFound = db.query.major.findFirst({
        where: (col, { eq }) => eq(col.id, newStudent.majorId),
      });
      const departmentIdFound = db.query.department.findFirst({
        where: (col, { eq }) => eq(col.id, newStudent.departmentId),
      });
      const facultyIdFound = db.query.faculty.findFirst({
        where: (col, { eq }) => eq(col.id, newStudent.facultyId),
      });
      const npmFound = db.query.student.findFirst({
        columns: { id: true },
        where: (col, { eq }) => eq(col.npm, newStudent.npm),
      });

      const [major, department, faculty, npm] = await Promise.all([
        majorIdFound,
        departmentIdFound,
        facultyIdFound,
        npmFound,
      ]);

      const data = [];

      if (!department) {
        data.push({
          field: "department",
          message: "Jurusan tidak ditemukan",
        });
      }

      if (!faculty) {
        data.push({
          field: "faculty",
          message: "Fakultas tidak ditemukan",
        });
      }

      if (!department || !major || !faculty) {
        throw status(422, {
          status: "fail",
          data,
        } satisfies FailResponseModel);
      }

      // TODO: MAKE THIS LATER WHERE NPM MUST BE CHECKED

      const result = await db
        .insert(studentsTable)
        .values(newStudent)
        .returning()
        .onConflictDoUpdate({
          target: studentsTable.npm,
          targetWhere: sql`npm = ${newStudent.npm}`,
          set: { ...newStudent },
        });

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async updateStudent(npm: string, student: UpdateStudentModel) {
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
      SystemService.errorHandle(error);
    }
  }
}
