import db from "../../db";
import { SystemService } from "../system/service";

export abstract class FilterService {
  static async getStudentFilter() {
    try {
      const degrees = db.query.degree.findMany();
      const departments = db.query.department.findMany();
      const enrollmentYears = db.query.enrollmentYear.findMany();
      const faculties = db.query.faculty.findMany();
      const majors = db.query.major.findMany();

      const [a, b, c, d, e] = await Promise.all([
        degrees,
        departments,
        enrollmentYears,
        faculties,
        majors,
      ]);

      return {
        degrees: a,
        departments: b,
        enrollmentYears: c,
        faculties: d,
        majors: e,
      };
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }
}
