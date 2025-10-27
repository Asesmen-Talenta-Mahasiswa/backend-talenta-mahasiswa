import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import db from "../../db";
import { studentsTable } from "../../db/schema";
import { DatabaseService } from "../../db/service";
import { NewStudentModel, UpdateStudentModel } from "./model";
import { InternalServerError } from "elysia";

export abstract class StudentService {
  static async getStudents(
    page = 1,
    pageSize = 10,
    search = "",
    year: number[] = [],
    program: string[] = [],
    faculty: string[] = [],
    degree: string[] = [],
    sort: "asc" | "desc" = "desc"
  ) {
    try {
      // 1. Define the common WHERE clause logic
      const whereClause = and(
        or(
          search ? ilike(studentsTable.npm, `%${search}%`) : undefined,
          search ? ilike(studentsTable.name, `%${search}%`) : undefined
        ),
        and(
          program.length > 0 ? inArray(studentsTable.program, program) : undefined,
          faculty.length > 0 ? inArray(studentsTable.faculty, faculty) : undefined,
          year.length > 0 ? inArray(studentsTable.year, year) : undefined,
          degree.length > 0 ? inArray(studentsTable.degree, degree) : undefined
        )
      );

      // 2. Create a Common Table Expression (CTE) with just the filtered student IDs
      const filteredStudentsCte = db
        .select({
          id: studentsTable.id,
        })
        .from(studentsTable)
        .where(whereClause)
        .as("filtered_students");

      // 3. Run the main query using the CTE
      const paginatedStudentIds = await db
        .with(filteredStudentsCte)
        .select({
          id: filteredStudentsCte.id,
          // Get the total count from the CTE *before* pagination
          totalItems: sql<string>`count(*) OVER()`.as("total_items"),
        })
        .from(filteredStudentsCte)
        .orderBy(
          sort === "desc" ? desc(filteredStudentsCte.id) : asc(filteredStudentsCte.id)
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      if (paginatedStudentIds.length === 0) {
        return {
          students: [],
          pagination: { page, pageSize, totalItems: 0, totalPages: 1 },
        };
      }

      // 4. Get the total count from the first row (it's the same for all rows)
      const totalItems = parseInt(paginatedStudentIds[0].totalItems, 10);
      const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;

      // 5. Get the list of student IDs we actually need
      const studentIds = paginatedStudentIds.map((s) => s.id);

      // 6. Fetch the *full* data (with submissions) only for those IDs
      // This is very fast as it's a primary key IN() query
      const students = await db.query.studentsTable.findMany({
        where: inArray(studentsTable.id, studentIds),
        // Restore the original sort order
        orderBy: (studentColumn, { desc, asc }) => [
          sort === "desc" ? desc(studentColumn.id) : asc(studentColumn.id),
        ],
        with: {
          submissions: {
            limit: 1,
            orderBy: (submissionColumn, { desc, asc }) => [
              sort === "desc" ? desc(submissionColumn.id) : asc(submissionColumn.id),
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
      });

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
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getStudent(npm: string) {
    try {
      const student = await db.query.studentsTable.findFirst({
        with: {
          submissions: {
            orderBy: (testSubmissionsTable, { desc }) => [desc(testSubmissionsTable.id)],
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
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async createStudent(newStudent: NewStudentModel) {
    try {
      const result = await db.insert(studentsTable).values(newStudent).returning();

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
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
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }
}
