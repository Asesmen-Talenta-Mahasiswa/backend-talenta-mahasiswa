import db from "../../db";
import { SystemService } from "../system/service";

export abstract class FilterService {
  static async getStudentFilter() {
    try {
      const departments = db.query.department.findMany();
      const faculties = db.query.faculty.findMany();
      const majors = db.query.major.findMany();

      const [a, b, c] = await Promise.all([departments, faculties, majors]);

      return {
        departments: a,
        faculties: b,
        majors: c,
      };
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }
}
