import { and, eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import { status } from "elysia";
import db, { Transaction } from "../../db";
import { student as studentsTable } from "../../db/schema";
import type {
  NewStudentModel,
  StudentModel,
  StudentQueryModel,
  UpdateStudentModel,
} from "./model";
import type { FailResponseModel } from "../../common/model";
import { SystemService } from "../system/service";

export abstract class StudentService {
  static async getStudents(query: StudentQueryModel = {}) {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      majorId = [],
      departmentId = [],
      facultyId = [],
      sortDirection = "desc",
    } = query;

    try {
      const whereClause = and(
        or(
          search ? like(studentsTable.npm, `${search}%`) : undefined,
          search ? ilike(studentsTable.name, `%${search}%`) : undefined,
        ),
        and(
          majorId.length > 0
            ? inArray(studentsTable.majorId, majorId)
            : undefined,
          facultyId.length > 0
            ? inArray(studentsTable.facultyId, facultyId)
            : undefined,
          departmentId.length > 0
            ? inArray(studentsTable.departmentId, departmentId)
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
      return await db.query.student.findFirst({
        where: eq(studentsTable.npm, npm),
        with: {
          user: true,
        },
      });
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async getStudentById(id: string) {
    try {
      return await db.query.student.findFirst({
        where: eq(studentsTable.id, id),
      });
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async createEmptyStudent(
    newStudent: NewStudentModel,
    tx: Transaction,
  ) {
    try {
      const majorIdFound = tx.query.major.findFirst({
        where: (col, { eq }) => eq(col.id, newStudent.majorId),
      });
      const departmentIdFound = tx.query.department.findFirst({
        where: (col, { eq }) => eq(col.id, newStudent.departmentId),
      });
      const facultyIdFound = tx.query.faculty.findFirst({
        where: (col, { eq }) => eq(col.id, newStudent.facultyId),
      });
      const npmFound = tx.query.student.findFirst({
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

      if (!major) {
        data.push({
          field: "major",
          message: "Program studi tidak ditemukan",
        });
      }

      if (npm) {
        data.push({
          field: "npm",
          message: "Mahasiswa sudah terdaftar",
        });
      }

      if (!department || !major || !faculty || npm) {
        throw status(422, {
          status: "fail",
          data,
        } satisfies FailResponseModel);
      }

      const result = await tx
        .insert(studentsTable)
        .values(newStudent)
        .returning();

      if (result.length === 0) {
        throw status(422, {
          status: "fail",
          data: [
            {
              field: "",
              message: "Gagal saat menambahkan data mahasiswa",
            },
          ],
        } satisfies FailResponseModel);
      }

      return result[0];
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

  static async putStudent(npm: string) {
    try {
      let student: StudentModel | undefined = undefined;

      student = await db.query.student.findFirst({
        where: (col, { eq }) => eq(col.npm, npm),
      });

      if (!student) {
        throw status(404, {
          status: "fail",
          data: [
            {
              field: "npm",
              message: "Mahasiswa tidak ditemukan",
            },
          ],
        } satisfies FailResponseModel);
      }

      return student;
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }
}
